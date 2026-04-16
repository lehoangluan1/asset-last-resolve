import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { disposalRequests } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Search, MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function DisposalPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return disposalRequests.filter(d => {
      const s = !search || d.assetName.toLowerCase().includes(search.toLowerCase());
      const st = statusFilter === 'all' || d.status === statusFilter;
      return s && st;
    });
  }, [search, statusFilter]);

  const pg = usePagination(filtered);

  return (
    <div>
      <PageHeader title="Disposal" description="Asset disposal proposals and approvals" />
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
              {['proposed','under-review','approved','rejected','deferred','completed'].map(s => (
                <SelectItem key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Reason</TableHead><TableHead>Proposed By</TableHead><TableHead>Est. Value</TableHead><TableHead>Status</TableHead><TableHead className="w-[50px]"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {pg.paginatedItems.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No disposal requests</TableCell></TableRow> :
              pg.paginatedItems.map(d => (
                <TableRow key={d.id}>
                  <TableCell><div><p className="font-medium text-sm">{d.assetName}</p><p className="text-xs text-muted-foreground">{d.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{d.reason}</TableCell>
                  <TableCell className="text-sm">{d.proposedBy}</TableCell>
                  <TableCell className="text-sm">${d.estimatedValue.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.success('Approved')}><CheckCircle className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.error('Rejected')}><XCircle className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Deferred')}><Clock className="h-4 w-4 mr-2" />Defer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationBar page={pg.page} pageSize={pg.pageSize} totalPages={pg.totalPages} totalItems={pg.totalItems}
            canPrev={pg.canPrev} canNext={pg.canNext} onPageChange={pg.setPage} onPageSizeChange={pg.setPageSize}
            firstPage={pg.firstPage} lastPage={pg.lastPage} nextPage={pg.nextPage} prevPage={pg.prevPage} />
        </div>
      </div>
    </div>
  );
}
