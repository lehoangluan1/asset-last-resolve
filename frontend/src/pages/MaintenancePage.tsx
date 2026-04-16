import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { maintenanceRecords as seedRecords, assets, users, departments } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { MaintenanceRecord } from '@/types';

const emptyForm = {
  assetId: '', type: 'Preventive', description: '', techCondition: 'good' as const,
  status: 'scheduled' as const, priority: 'normal' as const, assignedTo: '',
  scheduledDate: '', completedDate: '', cost: '', notes: '',
};

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>(seedRecords);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return records.filter(m => {
      const s = !search || m.assetName.toLowerCase().includes(search.toLowerCase());
      const st = statusFilter === 'all' || m.status === statusFilter;
      return s && st;
    });
  }, [records, search, statusFilter]);

  const pg = usePagination(filtered);

  const openNew = () => { setForm(emptyForm); setErrors({}); setOpen(true); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.assetId) e.assetId = 'Please select an asset';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.assignedTo) e.assignedTo = 'Technician is required';
    if (!form.scheduledDate) e.scheduledDate = 'Scheduled date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const asset = assets.find(a => a.id === form.assetId);
    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      assetId: form.assetId,
      assetCode: asset?.code || '',
      assetName: asset?.name || '',
      type: form.type,
      description: form.description.trim(),
      techCondition: form.techCondition,
      status: form.status,
      priority: form.priority,
      assignedTo: form.assignedTo,
      scheduledDate: form.scheduledDate,
      completedDate: form.completedDate || null,
      cost: parseFloat(form.cost) || 0,
      notes: form.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRecords(prev => [newRecord, ...prev]);
    setOpen(false);
    toast.success('Maintenance record created');
  };

  const technicians = users.filter(u => u.role === 'technician' || u.role === 'officer');

  return (
    <div>
      <PageHeader title="Maintenance" description="Asset maintenance records and scheduling">
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Add Record</Button>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              {pg.paginatedItems.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No records found</TableCell></TableRow> :
              pg.paginatedItems.map(m => (
                <TableRow key={m.id}>
                  <TableCell><div><p className="font-medium text-sm">{m.assetName}</p><p className="text-xs text-muted-foreground">{m.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{m.type}</TableCell>
                  <TableCell><StatusBadge status={m.techCondition} /></TableCell>
                  <TableCell><StatusBadge status={m.priority} /></TableCell>
                  <TableCell className="text-sm">{m.assignedTo}</TableCell>
                  <TableCell className="text-sm">{m.scheduledDate}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationBar page={pg.page} pageSize={pg.pageSize} totalPages={pg.totalPages} totalItems={pg.totalItems}
            canPrev={pg.canPrev} canNext={pg.canNext} onPageChange={pg.setPage} onPageSizeChange={pg.setPageSize}
            firstPage={pg.firstPage} lastPage={pg.lastPage} nextPage={pg.nextPage} prevPage={pg.prevPage} />
        </div>
      </div>

      {/* New Maintenance Record Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Maintenance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Asset <span className="text-destructive">*</span></Label>
                <Select value={form.assetId} onValueChange={v => setForm(p => ({ ...p, assetId: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select asset" /></SelectTrigger>
                  <SelectContent>
                    {assets.slice(0, 30).map(a => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.assetId && <p className="text-xs text-destructive mt-1">{errors.assetId}</p>}
              </div>
              <div>
                <Label>Maintenance Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
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
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1.5" rows={2} placeholder="Describe the maintenance need..." />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Condition Before</Label>
                <Select value={form.techCondition} onValueChange={v => setForm(p => ({ ...p, techCondition: v as any }))}>
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
                <Select value={form.assignedTo} onValueChange={v => setForm(p => ({ ...p, assignedTo: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    {technicians.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.assignedTo && <p className="text-xs text-destructive mt-1">{errors.assignedTo}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Scheduled Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} className="mt-1.5" />
                {errors.scheduledDate && <p className="text-xs text-destructive mt-1">{errors.scheduledDate}</p>}
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v as any }))}>
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
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as any }))}>
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
                <Input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} className="mt-1.5" placeholder="0.00" />
              </div>
              <div>
                <Label>Completed Date</Label>
                <Input type="date" value={form.completedDate} onChange={e => setForm(p => ({ ...p, completedDate: e.target.value }))} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mt-1.5" rows={2} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Create Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
