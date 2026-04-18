import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Eye, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { PaginationBar } from '@/components/PaginationBar';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api, HttpError } from '@/lib/api';
import { grants } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const emptyCreateForm = {
  assetId: '',
  type: 'location',
  severity: 'medium',
  expectedValue: '',
  observedValue: '',
  rootCause: '',
  notes: '',
};

export default function DiscrepanciesPage() {
  const queryClient = useQueryClient();
  const { hasGrant } = useAuth();
  const canManage = hasGrant(grants.discrepanciesManage);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === '1');
  const [createForm, setCreateForm] = useState({
    ...emptyCreateForm,
    assetId: searchParams.get('assetId') ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ['discrepancies', search, statusFilter, severityFilter, page, pageSize],
    queryFn: () => api.discrepancies.list({
      search,
      status: statusFilter === 'all' ? undefined : statusFilter,
      severity: severityFilter === 'all' ? undefined : severityFilter,
      page: page - 1,
      size: pageSize,
    }),
  });

  const assetsQuery = useQuery({
    queryKey: ['discrepancy-assets'],
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

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'reconcile' | 'escalate' | 'maintenance' }) => {
      if (action === 'reconcile') return api.discrepancies.reconcile(id);
      if (action === 'escalate') return api.discrepancies.escalate(id);
      return api.discrepancies.maintenance(id);
    },
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discrepancies'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['asset-detail', updated.assetId] });
      const messages = {
        reconcile: 'Resolved',
        escalate: 'Escalated',
        maintenance: 'Sent to maintenance',
      } as const;
      toast.success(messages[variables.action]);
      setDetailId(null);
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to update discrepancy');
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.discrepancies.create({
      assetId: createForm.assetId,
      type: createForm.type,
      severity: createForm.severity,
      expectedValue: createForm.expectedValue,
      observedValue: createForm.observedValue,
      rootCause: createForm.rootCause || undefined,
      notes: createForm.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discrepancies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['verification-campaigns'] });
      if (createForm.assetId) {
        queryClient.invalidateQueries({ queryKey: ['asset-detail', createForm.assetId] });
      }
      toast.success('Discrepancy created');
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      setErrors({});
      syncCreateParams(false);
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to create discrepancy');
    },
  });

  const data = query.data;
  const discrepancy = data?.items.find(item => item.id === detailId) ?? null;

  const openCreate = (assetId?: string) => {
    setCreateForm({ ...emptyCreateForm, assetId: assetId ?? '' });
    setErrors({});
    setCreateOpen(true);
    syncCreateParams(true, assetId);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!createForm.assetId) nextErrors.assetId = 'Select an asset';
    if (!createForm.expectedValue.trim()) nextErrors.expectedValue = 'Expected value is required';
    if (!createForm.observedValue.trim()) nextErrors.observedValue = 'Observed value is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div>
      <PageHeader title="Discrepancies" description="Verification mismatch resolution center">
        {canManage && <Button size="sm" onClick={() => openCreate(searchParams.get('assetId') ?? undefined)}><Plus className="mr-1.5 h-4 w-4" />New Discrepancy</Button>}
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={value => { setSeverityFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Type</TableHead><TableHead>Severity</TableHead><TableHead>Expected</TableHead><TableHead>Observed</TableHead><TableHead>Status</TableHead><TableHead className="w-[50px]"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {query.isLoading ? <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Loading discrepancies...</TableCell></TableRow> :
              data?.items.length ? data.items.map(item => (
                <TableRow key={item.id} className={item.severity === 'critical' ? 'bg-destructive/5' : ''}>
                  <TableCell><div><p className="text-sm font-medium">{item.assetName}</p><p className="text-xs text-muted-foreground">{item.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm capitalize">{item.type}</TableCell>
                  <TableCell><StatusBadge status={item.severity} /></TableCell>
                  <TableCell className="text-sm">{item.expectedValue}</TableCell>
                  <TableCell className="text-sm text-destructive">{item.observedValue}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(item.id)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No discrepancies found</TableCell></TableRow>}
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

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Discrepancy Detail</DialogTitle></DialogHeader>
          {discrepancy && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Asset</p><p className="font-medium">{discrepancy.assetName} ({discrepancy.assetCode})</p></div>
                <div><p className="text-xs text-muted-foreground">Type</p><p className="capitalize">{discrepancy.type}</p></div>
                <div><p className="text-xs text-muted-foreground">Expected</p><p>{discrepancy.expectedValue}</p></div>
                <div><p className="text-xs text-muted-foreground">Observed</p><p className="font-medium text-destructive">{discrepancy.observedValue}</p></div>
                <div><p className="text-xs text-muted-foreground">Severity</p><StatusBadge status={discrepancy.severity} /></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={discrepancy.status} /></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Root Cause</p><p>{discrepancy.rootCause || '-'}</p></div>
              </div>
              {canManage && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => actionMutation.mutate({ id: discrepancy.id, action: 'reconcile' })}>Reconcile</Button>
                  <Button size="sm" variant="outline" onClick={() => actionMutation.mutate({ id: discrepancy.id, action: 'escalate' })}>Escalate</Button>
                  <Button size="sm" variant="outline" onClick={() => actionMutation.mutate({ id: discrepancy.id, action: 'maintenance' })}>Maintenance</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) syncCreateParams(false); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Create Discrepancy</DialogTitle></DialogHeader>
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
              <p className="text-xs text-muted-foreground">The latest verification task for the selected asset will be used automatically.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={createForm.type} onValueChange={value => setCreateForm(current => ({ ...current, type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                    <SelectItem value="assignee">Assignee</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={createForm.severity} onValueChange={value => setCreateForm(current => ({ ...current, severity: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expected Value</Label>
              <Input value={createForm.expectedValue} onChange={event => setCreateForm(current => ({ ...current, expectedValue: event.target.value }))} placeholder="Expected location, condition, or owner" />
              {errors.expectedValue && <p className="text-xs text-destructive">{errors.expectedValue}</p>}
            </div>
            <div className="space-y-2">
              <Label>Observed Value</Label>
              <Input value={createForm.observedValue} onChange={event => setCreateForm(current => ({ ...current, observedValue: event.target.value }))} placeholder="Observed value" />
              {errors.observedValue && <p className="text-xs text-destructive">{errors.observedValue}</p>}
            </div>
            <div className="space-y-2">
              <Label>Root Cause</Label>
              <Textarea value={createForm.rootCause} onChange={event => setCreateForm(current => ({ ...current, rootCause: event.target.value }))} rows={2} placeholder="Optional investigation notes..." />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={createForm.notes} onChange={event => setCreateForm(current => ({ ...current, notes: event.target.value }))} rows={2} placeholder="Optional resolution guidance..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); syncCreateParams(false); }}>Cancel</Button>
            <Button onClick={() => { if (validate()) createMutation.mutate(); }} disabled={createMutation.isPending}>Create Discrepancy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
