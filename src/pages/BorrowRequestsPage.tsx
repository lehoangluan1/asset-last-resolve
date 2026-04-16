import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { borrowRequests, getDepartmentById } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, MoreHorizontal, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { BorrowStatus } from '@/types';

export default function BorrowRequestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return borrowRequests.filter(b => {
      const s = !search || b.assetName.toLowerCase().includes(search.toLowerCase()) || b.requesterName.toLowerCase().includes(search.toLowerCase());
      const st = statusFilter === 'all' || b.status === statusFilter;
      return s && st;
    });
  }, [search, statusFilter]);

  const pg = usePagination(filtered);
  const detail = showDetail ? borrowRequests.find(b => b.id === showDetail) : null;

  return (
    <div>
      <PageHeader title="Borrow Requests" description="Equipment borrowing requests and approvals">
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Request</Button>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(['draft','pending-approval','approved','rejected','checked-out','returned','overdue','cancelled'] as BorrowStatus[]).map(s => (
                <SelectItem key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Requester</TableHead><TableHead>Department</TableHead><TableHead>Purpose</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead className="w-[50px]"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {pg.paginatedItems.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No requests found</TableCell></TableRow> :
              pg.paginatedItems.map(b => (
                <TableRow key={b.id}>
                  <TableCell><div><p className="font-medium text-sm">{b.assetName}</p><p className="text-xs text-muted-foreground">{b.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{b.requesterName}</TableCell>
                  <TableCell className="text-sm">{getDepartmentById(b.departmentId)?.code}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{b.purpose}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.borrowDate} — {b.returnDate}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowDetail(b.id)}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success('Request approved')}><CheckCircle className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.error('Request rejected')}><XCircle className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
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

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Borrow Request Details</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">Asset</p><p className="font-medium">{detail.assetName}</p></div>
                <div><p className="text-muted-foreground text-xs">Requester</p><p className="font-medium">{detail.requesterName}</p></div>
                <div><p className="text-muted-foreground text-xs">Borrow Date</p><p>{detail.borrowDate}</p></div>
                <div><p className="text-muted-foreground text-xs">Return Date</p><p>{detail.returnDate}</p></div>
                <div><p className="text-muted-foreground text-xs">Purpose</p><p>{detail.purpose}</p></div>
                <div><p className="text-muted-foreground text-xs">Status</p><StatusBadge status={detail.status} /></div>
              </div>
              {detail.notes && <div className="text-sm"><p className="text-muted-foreground text-xs">Notes</p><p>{detail.notes}</p></div>}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => { toast.success('Approved'); setShowDetail(null); }}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => { toast.error('Rejected'); setShowDetail(null); }}>Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Borrow Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Asset</Label><Input placeholder="Search or select asset..." /></div>
            <div className="space-y-2"><Label>Purpose</Label><Input placeholder="Meeting, demo, training..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Borrow Date</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Return Date</Label><Input type="date" /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Additional details..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => { toast.success('Request submitted'); setShowCreate(false); }}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
