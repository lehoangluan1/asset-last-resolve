import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { PaginationBar } from '@/components/PaginationBar';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api, HttpError } from '@/lib/api';
import { grants } from '@/lib/permissions';
import type { MaintenanceRecord, PageResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const emptyCreateForm = {
  assetId: '',
  type: 'Preventive',
  description: '',
  techCondition: 'good',
  status: 'scheduled',
  priority: 'normal',
  assignedToUserId: '',
  scheduledDate: '',
  completedDate: '',
  cost: '',
  notes: '',
};

const nextStatusFor = (record: MaintenanceRecord) => {
  if (record.status === 'scheduled') return 'in-progress';
  if (record.status === 'in-progress') return 'completed';
  return null;
};

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const { user, hasGrant } = useAuth();
  const isTechnician = user?.role === 'technician';
  const canCreate = user?.role === 'admin' || user?.role === 'officer';
  const canManage = hasGrant(grants.maintenanceManage);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(isTechnician ? 'actionable' : 'all');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [statusDialogRecord, setStatusDialogRecord] = useState<MaintenanceRecord | null>(null);
  const [statusForm, setStatusForm] = useState({ completedDate: '', notes: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const recordsQuery = useQuery({
    queryKey: ['maintenance', search, statusFilter, page, pageSize],
    queryFn: () => api.maintenance.list({
      search,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: page - 1,
      size: pageSize,
    }),
  });
  const assetsQuery = useQuery({
    queryKey: ['maintenance-assets'],
    queryFn: () => api.assets.list({ page: 0, size: 100 }),
  });
  const techniciansQuery = useQuery({
    queryKey: ['maintenance-technicians'],
    queryFn: () => api.reference.usersByRoles(['technician', 'officer']),
  });

  const patchMaintenanceRecord = (updated: MaintenanceRecord) => {
    queryClient.setQueriesData<PageResponse<MaintenanceRecord>>({ queryKey: ['maintenance'] }, current => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map(item => item.id === updated.id ? updated : item),
      };
    });
    queryClient.setQueryData(['asset-detail', updated.assetId], (current: any) => {
      if (!current) return current;
      return {
        ...current,
        asset: {
          ...current.asset,
          lifecycle: updated.status === 'completed'
            ? (current.asset.assignedToId ? 'in-use' : 'in-storage')
            : 'under-maintenance',
        },
        maintenanceRecords: current.maintenanceRecords?.map((item: MaintenanceRecord) => item.id === updated.id ? updated : item) ?? current.maintenanceRecords,
      };
    });
  };

  const createMutation = useMutation({
    mutationFn: () => api.maintenance.create({
      ...createForm,
      cost: createForm.cost ? Number(createForm.cost) : 0,
      completedDate: createForm.completedDate || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      if (createForm.assetId) {
        queryClient.invalidateQueries({ queryKey: ['asset-detail', createForm.assetId] });
      }
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      toast.success('Maintenance record created');
    },
    onError: (error) => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to create maintenance record');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (record: MaintenanceRecord) => api.maintenance.updateStatus(record.id, {
      status: nextStatusFor(record)!,
      completedDate: statusForm.completedDate || undefined,
      notes: statusForm.notes || undefined,
    }),
    onSuccess: updated => {
      patchMaintenanceRecord(updated);
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-detail', updated.assetId] });
      toast.success(updated.status === 'completed' ? 'Maintenance completed' : 'Maintenance started');
      setStatusDialogRecord(null);
      setStatusForm({ completedDate: '', notes: '' });
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to update maintenance status');
    },
  });

  const validateCreate = () => {
    const nextErrors: Record<string, string> = {};
    if (!createForm.assetId) nextErrors.assetId = 'Please select an asset';
    if (!createForm.description.trim()) nextErrors.description = 'Description is required';
    if (!createForm.assignedToUserId) nextErrors.assignedToUserId = 'Technician is required';
    if (!createForm.scheduledDate) nextErrors.scheduledDate = 'Scheduled date is required';
    setCreateErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openCreate = () => {
    setCreateErrors({});
    setCreateForm(emptyCreateForm);
    setCreateOpen(true);
  };

  const canUpdateRecord = (record: MaintenanceRecord) => {
    if (!canManage) return false;
    if (!nextStatusFor(record)) return false;
    if (user?.role === 'technician') return record.assignedToId === user.id;
    return user?.role === 'admin' || user?.role === 'officer';
  };

  const records = useMemo(() => recordsQuery.data?.items ?? [], [recordsQuery.data]);

  return (
    <div>
      <PageHeader title="Maintenance" description="Existing maintenance records and status transitions">
        {canCreate && <Button size="sm" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />Add Record</Button>}
      </PageHeader>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Statuses" /></SelectTrigger>
            <SelectContent>
              {isTechnician ? (
                <>
                  <SelectItem value="actionable">Actionable</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="actionable">Actionable</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="w-[140px]">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordsQuery.isLoading ? (
                <TableRow><TableCell colSpan={canManage ? 8 : 7} className="py-12 text-center text-muted-foreground">Loading maintenance records...</TableCell></TableRow>
              ) : records.length ? records.map(record => (
                <TableRow key={record.id}>
                  <TableCell><div><p className="text-sm font-medium">{record.assetName}</p><p className="text-xs text-muted-foreground">{record.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{record.type}</TableCell>
                  <TableCell><StatusBadge status={record.techCondition} /></TableCell>
                  <TableCell><StatusBadge status={record.priority} /></TableCell>
                  <TableCell className="text-sm">{record.assignedTo}</TableCell>
                  <TableCell className="text-sm">{record.scheduledDate}</TableCell>
                  <TableCell><StatusBadge status={record.status} /></TableCell>
                  {canManage && (
                    <TableCell>
                      {canUpdateRecord(record) ? (
                        <Button variant="outline" size="sm" onClick={() => { setStatusDialogRecord(record); setStatusForm({ completedDate: '', notes: record.notes || '' }); }}>
                          <RefreshCcw className="mr-1.5 h-4 w-4" />Update Status
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No action</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={canManage ? 8 : 7} className="py-12 text-center text-muted-foreground">{isTechnician ? 'No actionable maintenance records found' : 'No records found'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalPages={recordsQuery.data?.totalPages ?? 1}
            totalItems={recordsQuery.data?.totalItems ?? 0}
            canPrev={page > 1}
            canNext={page < (recordsQuery.data?.totalPages ?? 1)}
            onPageChange={setPage}
            onPageSizeChange={size => { setPageSize(size); setPage(1); }}
            firstPage={() => setPage(1)}
            lastPage={() => setPage(recordsQuery.data?.totalPages ?? 1)}
            nextPage={() => setPage(current => Math.min(current + 1, recordsQuery.data?.totalPages ?? 1))}
            prevPage={() => setPage(current => Math.max(current - 1, 1))}
          />
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>New Maintenance Record</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Asset <span className="text-destructive">*</span></Label>
                <Select value={createForm.assetId} onValueChange={value => setCreateForm(current => ({ ...current, assetId: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select asset" /></SelectTrigger>
                  <SelectContent>
                    {assetsQuery.data?.items.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.code} - {asset.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {createErrors.assetId && <p className="mt-1 text-xs text-destructive">{createErrors.assetId}</p>}
              </div>
              <div>
                <Label>Maintenance Type</Label>
                <Select value={createForm.type} onValueChange={value => setCreateForm(current => ({ ...current, type: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                    <SelectItem value="Calibration">Calibration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description / Issue <span className="text-destructive">*</span></Label>
              <Textarea value={createForm.description} onChange={event => setCreateForm(current => ({ ...current, description: event.target.value }))} className="mt-1.5" rows={2} placeholder="Describe the maintenance need..." />
              {createErrors.description && <p className="mt-1 text-xs text-destructive">{createErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Condition Before</Label>
                <Select value={createForm.techCondition} onValueChange={value => setCreateForm(current => ({ ...current, techCondition: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="needs-monitoring">Needs Monitoring</SelectItem>
                    <SelectItem value="under-repair">Under Repair</SelectItem>
                    <SelectItem value="not-ready">Not Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Technician <span className="text-destructive">*</span></Label>
                <Select value={createForm.assignedToUserId} onValueChange={value => setCreateForm(current => ({ ...current, assignedToUserId: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    {techniciansQuery.data?.map(technician => <SelectItem key={technician.id} value={technician.id}>{technician.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {createErrors.assignedToUserId && <p className="mt-1 text-xs text-destructive">{createErrors.assignedToUserId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Scheduled Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={createForm.scheduledDate} onChange={event => setCreateForm(current => ({ ...current, scheduledDate: event.target.value }))} className="mt-1.5" />
                {createErrors.scheduledDate && <p className="mt-1 text-xs text-destructive">{createErrors.scheduledDate}</p>}
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={createForm.priority} onValueChange={value => setCreateForm(current => ({ ...current, priority: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Initial Status</Label>
                <Select value={createForm.status} onValueChange={value => setCreateForm(current => ({ ...current, status: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cost Estimate</Label>
                <Input type="number" value={createForm.cost} onChange={event => setCreateForm(current => ({ ...current, cost: event.target.value }))} className="mt-1.5" placeholder="0.00" />
              </div>
              <div>
                <Label>Completed Date</Label>
                <Input type="date" value={createForm.completedDate} onChange={event => setCreateForm(current => ({ ...current, completedDate: event.target.value }))} className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={createForm.notes} onChange={event => setCreateForm(current => ({ ...current, notes: event.target.value }))} className="mt-1.5" rows={2} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (validateCreate()) createMutation.mutate(); }} disabled={createMutation.isPending}>Create Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusDialogRecord} onOpenChange={() => setStatusDialogRecord(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Update Maintenance Status</DialogTitle></DialogHeader>
          {statusDialogRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Asset</p><p className="font-medium">{statusDialogRecord.assetName}</p></div>
                <div><p className="text-xs text-muted-foreground">Assigned To</p><p>{statusDialogRecord.assignedTo}</p></div>
                <div><p className="text-xs text-muted-foreground">Current Status</p><StatusBadge status={statusDialogRecord.status} /></div>
                <div><p className="text-xs text-muted-foreground">Next Status</p><StatusBadge status={nextStatusFor(statusDialogRecord)!} /></div>
              </div>
              {nextStatusFor(statusDialogRecord) === 'completed' && (
                <div className="space-y-2">
                  <Label>Completed Date</Label>
                  <Input type="date" value={statusForm.completedDate} onChange={event => setStatusForm(current => ({ ...current, completedDate: event.target.value }))} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={statusForm.notes} onChange={event => setStatusForm(current => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Update notes for this transition..." />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusDialogRecord(null)}>Cancel</Button>
                <Button onClick={() => updateStatusMutation.mutate(statusDialogRecord)} disabled={updateStatusMutation.isPending}>
                  Save Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
