import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { api, HttpError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscrepanciesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'reconcile' | 'escalate' | 'maintenance' }) => {
      if (action === 'reconcile') return api.discrepancies.reconcile(id);
      if (action === 'escalate') return api.discrepancies.escalate(id);
      return api.discrepancies.maintenance(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discrepancies'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const messages = {
        reconcile: 'Resolved',
        escalate: 'Escalated',
        maintenance: 'Sent to maintenance',
      } as const;
      toast.success(messages[variables.action]);
      setDetailId(null);
    },
    onError: (error) => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to update discrepancy');
    },
  });

  const data = query.data;
  const discrepancy = data?.items.find(item => item.id === detailId) ?? null;

  return (
    <div>
      <PageHeader title="Discrepancies" description="Verification mismatch resolution center" />
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
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Type</TableHead><TableHead>Severity</TableHead><TableHead>Expected</TableHead><TableHead>Observed</TableHead><TableHead>Status</TableHead><TableHead className="w-[50px]"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {query.isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading discrepancies...</TableCell></TableRow> :
              data?.items.length ? data.items.map(item => (
                <TableRow key={item.id} className={item.severity === 'critical' ? 'bg-destructive/5' : ''}>
                  <TableCell><div><p className="font-medium text-sm">{item.assetName}</p><p className="text-xs text-muted-foreground">{item.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm capitalize">{item.type}</TableCell>
                  <TableCell><StatusBadge status={item.severity} /></TableCell>
                  <TableCell className="text-sm">{item.expectedValue}</TableCell>
                  <TableCell className="text-sm text-destructive">{item.observedValue}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(item.id)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No discrepancies found</TableCell></TableRow>}
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
                <div><p className="text-muted-foreground text-xs">Asset</p><p className="font-medium">{discrepancy.assetName} ({discrepancy.assetCode})</p></div>
                <div><p className="text-muted-foreground text-xs">Type</p><p className="capitalize">{discrepancy.type}</p></div>
                <div><p className="text-muted-foreground text-xs">Expected</p><p>{discrepancy.expectedValue}</p></div>
                <div><p className="text-muted-foreground text-xs">Observed</p><p className="text-destructive font-medium">{discrepancy.observedValue}</p></div>
                <div><p className="text-muted-foreground text-xs">Severity</p><StatusBadge status={discrepancy.severity} /></div>
                <div><p className="text-muted-foreground text-xs">Status</p><StatusBadge status={discrepancy.status} /></div>
                <div><p className="text-muted-foreground text-xs">Root Cause</p><p>{discrepancy.rootCause || '—'}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => actionMutation.mutate({ id: discrepancy.id, action: 'reconcile' })}>Reconcile</Button>
                <Button size="sm" variant="outline" onClick={() => actionMutation.mutate({ id: discrepancy.id, action: 'escalate' })}>Escalate</Button>
                <Button size="sm" variant="outline" onClick={() => actionMutation.mutate({ id: discrepancy.id, action: 'maintenance' })}>Maintenance</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
