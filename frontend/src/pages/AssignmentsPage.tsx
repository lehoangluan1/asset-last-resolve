import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { api, HttpError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { grants } from '@/lib/permissions';
import type { Assignment } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
  assetId: '',
  toUserId: '',
  type: 'permanent',
  effectiveDate: '',
  returnDate: '',
  notes: '',
};

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasGrant } = useAuth();
  const canManageAssignments = hasGrant(grants.assignmentsManage);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ['assignments', search, typeFilter, page, pageSize],
    queryFn: () => api.assignments.list({
      search,
      type: typeFilter === 'all' ? undefined : typeFilter,
      page: page - 1,
      size: pageSize,
    }),
  });

  const assetsQuery = useQuery({
    queryKey: ['assignment-assets'],
    queryFn: () => api.assets.list({ page: 0, size: 100 }),
    enabled: canManageAssignments,
  });

  const usersQuery = useQuery({
    queryKey: ['assignment-target-users'],
    queryFn: () => api.reference.usersByRoles(['employee', 'manager', 'officer', 'technician', 'auditor', 'admin']),
    enabled: canManageAssignments,
  });

  const availableAssets = useMemo(
    () => (assetsQuery.data?.items ?? []).filter(asset =>
      asset.lifecycle !== 'borrowed'
      && asset.lifecycle !== 'under-maintenance'
      && asset.lifecycle !== 'pending-disposal'
      && asset.lifecycle !== 'disposed',
    ),
    [assetsQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: () => api.assignments.create({
      assetId: form.assetId,
      toUserId: form.toUserId,
      type: form.type,
      effectiveDate: form.effectiveDate,
      returnDate: form.returnDate || undefined,
      notes: form.notes || undefined,
    }),
    onSuccess: created => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['asset-detail', created.assetId] });
      toast.success('Assignment created');
      closeCreate();
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to create assignment');
    },
  });

  useEffect(() => {
    if (!canManageAssignments || createOpen || searchParams.get('create') !== '1') {
      return;
    }
    const assetId = searchParams.get('assetId') ?? '';
    setForm(current => ({ ...emptyForm, assetId }));
    setErrors({});
    setCreateOpen(true);
  }, [canManageAssignments, createOpen, searchParams]);

  const data = query.data;

  const closeCreate = () => {
    setCreateOpen(false);
    setForm(emptyForm);
    setErrors({});
    if (searchParams.get('create') === '1' || searchParams.get('assetId')) {
      const next = new URLSearchParams(searchParams);
      next.delete('create');
      next.delete('assetId');
      setSearchParams(next);
    }
  };

  const openCreate = (assetId?: string) => {
    setForm({ ...emptyForm, assetId: assetId ?? '' });
    setErrors({});
    setCreateOpen(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.assetId) nextErrors.assetId = 'Please select an asset';
    if (!form.toUserId) nextErrors.toUserId = 'Please select an assignee';
    if (!form.effectiveDate) nextErrors.effectiveDate = 'Effective date is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div>
      <PageHeader title="Assignments & Transfers" description="Manage asset assignments, transfers, and borrow records">
        {canManageAssignments && (
          <Button size="sm" onClick={() => openCreate()}>
            <Plus className="mr-1.5 h-4 w-4" />New Assignment
          </Button>
        )}
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={value => { setTypeFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
              <SelectItem value="borrow">Borrow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Department</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {query.isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading assignments...</TableCell></TableRow> :
              data?.items.length ? data.items.map((assignment: Assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell><div><p className="font-medium text-sm">{assignment.assetName}</p><p className="text-xs text-muted-foreground">{assignment.assetCode}</p></div></TableCell>
                  <TableCell><StatusBadge status={assignment.type} /></TableCell>
                  <TableCell className="text-sm">{assignment.fromUserName || 'â€”'}</TableCell>
                  <TableCell className="text-sm">{assignment.toUserName}</TableCell>
                  <TableCell className="text-sm">{assignment.toDepartmentCode}</TableCell>
                  <TableCell className="text-sm">{assignment.effectiveDate}</TableCell>
                  <TableCell><StatusBadge status={assignment.status} /></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No assignments found</TableCell></TableRow>}
            </TableBody>
          </Table>
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalPages={data?.totalPages ?? 1}
            totalItems={data?.totalItems ?? 0}
            canPrev={page > 1}
            canNext={page < (data?.totalPages ?? 1)}
            onPageChange={setPage}
            onPageSizeChange={size => { setPageSize(size); setPage(1); }}
            firstPage={() => setPage(1)}
            lastPage={() => setPage(data?.totalPages ?? 1)}
            nextPage={() => setPage(current => Math.min(current + 1, data?.totalPages ?? 1))}
            prevPage={() => setPage(current => Math.max(current - 1, 1))}
          />
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={open => { if (!open) closeCreate(); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={form.assetId} onValueChange={value => setForm(current => ({ ...current, assetId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>
                  {availableAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>{asset.code} - {asset.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assetId && <p className="text-xs text-destructive">{errors.assetId}</p>}
            </div>

            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={form.toUserId} onValueChange={value => setForm(current => ({ ...current, toUserId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {usersQuery.data?.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name} - {user.departmentName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toUserId && <p className="text-xs text-destructive">{errors.toUserId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <Select value={form.type} onValueChange={value => setForm(current => ({ ...current, type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="borrow">Borrow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input type="date" value={form.effectiveDate} onChange={event => setForm(current => ({ ...current, effectiveDate: event.target.value }))} />
                {errors.effectiveDate && <p className="text-xs text-destructive">{errors.effectiveDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Return Date</Label>
              <Input type="date" value={form.returnDate} onChange={event => setForm(current => ({ ...current, returnDate: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Optional assignment notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCreate}>Cancel</Button>
            <Button onClick={() => { if (validate()) createMutation.mutate(); }} disabled={createMutation.isPending}>Create Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
