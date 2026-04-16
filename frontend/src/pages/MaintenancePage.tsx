import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { api, HttpError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
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

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const createMutation = useMutation({
    mutationFn: () => api.maintenance.create({
      ...form,
      cost: form.cost ? Number(form.cost) : 0,
      completedDate: form.completedDate || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setOpen(false);
      setForm(emptyForm);
      toast.success('Maintenance record created');
    },
    onError: (error) => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to create maintenance record');
    },
  });

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.assetId) nextErrors.assetId = 'Please select an asset';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.assignedToUserId) nextErrors.assignedToUserId = 'Technician is required';
    if (!form.scheduledDate) nextErrors.scheduledDate = 'Scheduled date is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openNew = () => { setForm(emptyForm); setErrors({}); setOpen(true); };
  const data = recordsQuery.data;

  return (
    <div>
      <PageHeader title="Maintenance" description="Asset maintenance records and scheduling">
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Add Record</Button>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Type</TableHead><TableHead>Condition</TableHead><TableHead>Priority</TableHead><TableHead>Assigned To</TableHead><TableHead>Scheduled</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {recordsQuery.isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading maintenance records...</TableCell></TableRow> :
              data?.items.length ? data.items.map(record => (
                <TableRow key={record.id}>
                  <TableCell><div><p className="font-medium text-sm">{record.assetName}</p><p className="text-xs text-muted-foreground">{record.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{record.type}</TableCell>
                  <TableCell><StatusBadge status={record.techCondition} /></TableCell>
                  <TableCell><StatusBadge status={record.priority} /></TableCell>
                  <TableCell className="text-sm">{record.assignedTo}</TableCell>
                  <TableCell className="text-sm">{record.scheduledDate}</TableCell>
                  <TableCell><StatusBadge status={record.status} /></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No records found</TableCell></TableRow>}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Maintenance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Asset <span className="text-destructive">*</span></Label>
                <Select value={form.assetId} onValueChange={value => setForm(current => ({ ...current, assetId: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select asset" /></SelectTrigger>
                  <SelectContent>
                    {assetsQuery.data?.items.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.code} — {asset.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.assetId && <p className="text-xs text-destructive mt-1">{errors.assetId}</p>}
              </div>
              <div>
                <Label>Maintenance Type</Label>
                <Select value={form.type} onValueChange={value => setForm(current => ({ ...current, type: value }))}>
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
              <Textarea value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} className="mt-1.5" rows={2} placeholder="Describe the maintenance need..." />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Condition Before</Label>
                <Select value={form.techCondition} onValueChange={value => setForm(current => ({ ...current, techCondition: value }))}>
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
                <Select value={form.assignedToUserId} onValueChange={value => setForm(current => ({ ...current, assignedToUserId: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    {techniciansQuery.data?.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.assignedToUserId && <p className="text-xs text-destructive mt-1">{errors.assignedToUserId}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Scheduled Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.scheduledDate} onChange={e => setForm(current => ({ ...current, scheduledDate: e.target.value }))} className="mt-1.5" />
                {errors.scheduledDate && <p className="text-xs text-destructive mt-1">{errors.scheduledDate}</p>}
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={value => setForm(current => ({ ...current, priority: value }))}>
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
                <Label>Status</Label>
                <Select value={form.status} onValueChange={value => setForm(current => ({ ...current, status: value }))}>
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
                <Input type="number" value={form.cost} onChange={e => setForm(current => ({ ...current, cost: e.target.value }))} className="mt-1.5" placeholder="0.00" />
              </div>
              <div>
                <Label>Completed Date</Label>
                <Input type="date" value={form.completedDate} onChange={e => setForm(current => ({ ...current, completedDate: e.target.value }))} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(current => ({ ...current, notes: e.target.value }))} className="mt-1.5" rows={2} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (validate()) createMutation.mutate(); }} disabled={createMutation.isPending}>Create Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
