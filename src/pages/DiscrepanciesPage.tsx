import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { discrepancies } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscrepanciesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [detail, setDetail] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return discrepancies.filter(d => {
      const s = !search || d.assetName.toLowerCase().includes(search.toLowerCase()) || d.assetCode.toLowerCase().includes(search.toLowerCase());
      const st = statusFilter === 'all' || d.status === statusFilter;
      const sv = severityFilter === 'all' || d.severity === severityFilter;
      return s && st && sv;
    });
  }, [search, statusFilter, severityFilter]);

  const pg = usePagination(filtered);
  const disc = detail ? discrepancies.find(d => d.id === detail) : null;

  return (
    <div>
      <PageHeader title="Discrepancies" description="Verification mismatch resolution center" />
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
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
              {pg.paginatedItems.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No discrepancies found</TableCell></TableRow> :
              pg.paginatedItems.map(d => (
                <TableRow key={d.id} className={d.severity === 'critical' ? 'bg-destructive/5' : ''}>
                  <TableCell><div><p className="font-medium text-sm">{d.assetName}</p><p className="text-xs text-muted-foreground">{d.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm capitalize">{d.type}</TableCell>
                  <TableCell><StatusBadge status={d.severity} /></TableCell>
                  <TableCell className="text-sm">{d.expectedValue}</TableCell>
                  <TableCell className="text-sm text-destructive">{d.observedValue}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetail(d.id)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationBar page={pg.page} pageSize={pg.pageSize} totalPages={pg.totalPages} totalItems={pg.totalItems}
            canPrev={pg.canPrev} canNext={pg.canNext} onPageChange={pg.setPage} onPageSizeChange={pg.setPageSize}
            firstPage={pg.firstPage} lastPage={pg.lastPage} nextPage={pg.nextPage} prevPage={pg.prevPage} />
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Discrepancy Detail</DialogTitle></DialogHeader>
          {disc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">Asset</p><p className="font-medium">{disc.assetName} ({disc.assetCode})</p></div>
                <div><p className="text-muted-foreground text-xs">Type</p><p className="capitalize">{disc.type}</p></div>
                <div><p className="text-muted-foreground text-xs">Expected</p><p>{disc.expectedValue}</p></div>
                <div><p className="text-muted-foreground text-xs">Observed</p><p className="text-destructive font-medium">{disc.observedValue}</p></div>
                <div><p className="text-muted-foreground text-xs">Severity</p><StatusBadge status={disc.severity} /></div>
                <div><p className="text-muted-foreground text-xs">Status</p><StatusBadge status={disc.status} /></div>
                <div><p className="text-muted-foreground text-xs">Root Cause</p><p>{disc.rootCause || '—'}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => { toast.success('Resolved'); setDetail(null); }}>Reconcile</Button>
                <Button size="sm" variant="outline" onClick={() => { toast.info('Escalated'); setDetail(null); }}>Escalate</Button>
                <Button size="sm" variant="outline" onClick={() => { toast.info('Sent to maintenance'); setDetail(null); }}>Maintenance</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
