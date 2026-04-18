import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, MoreHorizontal, Plus, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { PaginationBar } from '@/components/PaginationBar';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api, HttpError } from '@/lib/api';
import { grants } from '@/lib/permissions';
import type { DisposalRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const emptyCreateForm = {
  assetId: '',
  reason: '',
  estimatedValue: '',
  notes: '',
};

export default function DisposalPage() {
  const queryClient = useQueryClient();
  const { hasGrant } = useAuth();
  const canManage = hasGrant(grants.disposalManage);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === '1');
  const [createForm, setCreateForm] = useState({
    ...emptyCreateForm,
    assetId: searchParams.get('assetId') ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ['disposal', search, statusFilter, page, pageSize],
    queryFn: () => api.disposal.list({
      search,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: page - 1,
      size: pageSize,
    }),
  });

  const assetsQuery = useQuery({
    queryKey: ['disposal-assets'],
    queryFn: () => api.assets.list({ page: 0, size: 100 }),
    enabled: canManage,
  });

  const syncCreateParams = (open: boolean, assetId?: string) => {
    const next = new URLSearchParams(searchParams);
    if (open) {
      next.set('create', '1');
      if (assetId) next.set('assetId', assetId);
    } else {
      next.delete('create');
      next.delete('assetId');
    }
    setSearchParams(next, { replace: true });
  };

  const createMutation = useMutation({
    mutationFn: () => api.disposal.create({
      assetId: createForm.assetId,
      reason: createForm.reason,
      estimatedValue: createForm.estimatedValue ? Number(createForm.estimatedValue) : undefined,
      notes: createForm.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disposal'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      if (createForm.assetId) {
        queryClient.invalidateQueries({ queryKey: ['asset-detail', createForm.assetId] });
      }
      toast.success('Disposal item added');
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      setErrors({});
      syncCreateParams(false);
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to create disposal request');
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' | 'defer' }) => {
      if (action === 'approve') return api.disposal.approve(id);
      if (action === 'reject') return api.disposal.reject(id);
      return api.disposal.defer(id);
    },
    onSuccess: updated => {
      queryClient.invalidateQueries({ queryKey: ['disposal'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-detail', updated.assetId] });
      toast.success('Disposal request updated');
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to update disposal request');
    },
  });

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!createForm.assetId) nextErrors.assetId = 'Select an asset';
    if (!createForm.reason.trim()) nextErrors.reason = 'Reason is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openCreate = (assetId?: string) => {
    setCreateForm({ ...emptyCreateForm, assetId: assetId ?? '' });
    setErrors({});
    setCreateOpen(true);
    syncCreateParams(true, assetId);
  };

  const isActionable = (item: DisposalRequest) => ['proposed', 'under-review', 'deferred'].includes(item.status);
  const data = query.data;

  return (
    <div>
      <PageHeader title="Disposal" description="Asset disposal proposals and approvals">
        {canManage && <Button size="sm" onClick={() => openCreate(searchParams.get('assetId') ?? undefined)}><Plus className="mr-1.5 h-4 w-4" />Add Disposal Item</Button>}
      </PageHeader>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {['proposed', 'under-review', 'approved', 'rejected', 'deferred', 'completed'].map(status => (
                <SelectItem key={status} value={status}>{status.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Reason</TableHead><TableHead>Proposed By</TableHead><TableHead>Est. Value</TableHead><TableHead>Status</TableHead><TableHead className="w-[50px]"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {query.isLoading ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Loading disposal requests...</TableCell></TableRow> :
              data?.items.length ? data.items.map(item => (
                <TableRow key={item.id}>
                  <TableCell><div><p className="text-sm font-medium">{item.assetName}</p><p className="text-xs text-muted-foreground">{item.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{item.reason}</TableCell>
                  <TableCell className="text-sm">{item.proposedBy}</TableCell>
                  <TableCell className="text-sm">${item.estimatedValue.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    {canManage && isActionable(item) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => actionMutation.mutate({ id: item.id, action: 'approve' })}><CheckCircle className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actionMutation.mutate({ id: item.id, action: 'reject' })}><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actionMutation.mutate({ id: item.id, action: 'defer' })}><Clock className="mr-2 h-4 w-4" />Defer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : <span className="text-xs text-muted-foreground">-</span>}
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No disposal requests</TableCell></TableRow>}
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

      <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) syncCreateParams(false); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Add Disposal Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={createForm.assetId} onValueChange={value => setCreateForm(current => ({ ...current, assetId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>
                  {assetsQuery.data?.items.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.code} - {asset.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.assetId && <p className="text-xs text-destructive">{errors.assetId}</p>}
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={createForm.reason} onChange={event => setCreateForm(current => ({ ...current, reason: event.target.value }))} rows={3} placeholder="Explain why this asset should enter disposal review..." />
              {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
            </div>
            <div className="space-y-2">
              <Label>Estimated Value</Label>
              <Input type="number" value={createForm.estimatedValue} onChange={event => setCreateForm(current => ({ ...current, estimatedValue: event.target.value }))} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={createForm.notes} onChange={event => setCreateForm(current => ({ ...current, notes: event.target.value }))} rows={2} placeholder="Optional supporting notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); syncCreateParams(false); }}>Cancel</Button>
            <Button onClick={() => { if (validate()) createMutation.mutate(); }} disabled={createMutation.isPending}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
