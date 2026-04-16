import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { api, HttpError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { grants } from '@/lib/permissions';
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

const initialForm = {
  assetId: '',
  purpose: '',
  borrowDate: '',
  returnDate: '',
  notes: '',
};

export default function BorrowRequestsPage() {
  const queryClient = useQueryClient();
  const { hasGrant } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState(initialForm);

  const requestsQuery = useQuery({
    queryKey: ['borrow-requests', search, statusFilter, page, pageSize],
    queryFn: () => api.borrowRequests.list({
      search,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: page - 1,
      size: pageSize,
    }),
  });

  const assetOptionsQuery = useQuery({
    queryKey: ['borrowable-assets'],
    queryFn: () => api.assets.list({ page: 0, size: 100 }),
  });

  const borrowableAssets = useMemo(
    () => (assetOptionsQuery.data?.items ?? []).filter(asset => asset.borrowable),
    [assetOptionsQuery.data],
  );

  const decisionMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) => {
      return decision === 'approve' ? api.borrowRequests.approve(id) : api.borrowRequests.reject(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(variables.decision === 'approve' ? 'Request approved' : 'Request rejected');
      setShowDetail(null);
    },
    onError: (error) => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to update request');
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.borrowRequests.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Request submitted');
      setShowCreate(false);
      setForm(initialForm);
    },
    onError: (error) => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to submit request');
    },
  });

  const data = requestsQuery.data;
  const detail = data?.items.find(request => request.id === showDetail) ?? null;

  return (
    <div>
      <PageHeader title="Borrow Requests" description="Equipment borrowing requests and approvals">
        {hasGrant(grants.borrowsRequest) && (
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Request</Button>
        )}
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(['draft', 'pending-approval', 'approved', 'rejected', 'checked-out', 'returned', 'overdue', 'cancelled'] as BorrowStatus[]).map(status => (
                <SelectItem key={status} value={status}>{status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
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
              {requestsQuery.isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading requests...</TableCell></TableRow> :
              data?.items.length ? data.items.map(request => (
                <TableRow key={request.id}>
                  <TableCell><div><p className="font-medium text-sm">{request.assetName}</p><p className="text-xs text-muted-foreground">{request.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{request.requesterName}</TableCell>
                  <TableCell className="text-sm">{request.departmentName ?? '—'}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{request.purpose}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{request.borrowDate} — {request.returnDate}</TableCell>
                  <TableCell><StatusBadge status={request.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${request.assetName}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowDetail(request.id)}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                        {hasGrant(grants.borrowsApprove) && (
                          <>
                            <DropdownMenuItem onClick={() => decisionMutation.mutate({ id: request.id, decision: 'approve' })}><CheckCircle className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => decisionMutation.mutate({ id: request.id, decision: 'reject' })}><XCircle className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No requests found</TableCell></TableRow>}
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
              {hasGrant(grants.borrowsApprove) && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => decisionMutation.mutate({ id: detail.id, decision: 'approve' })}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => decisionMutation.mutate({ id: detail.id, decision: 'reject' })}>Reject</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Borrow Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={form.assetId} onValueChange={value => setForm(current => ({ ...current, assetId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select borrowable asset" /></SelectTrigger>
                <SelectContent>
                  {borrowableAssets.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.code} — {asset.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Purpose</Label><Input value={form.purpose} onChange={e => setForm(current => ({ ...current, purpose: e.target.value }))} placeholder="Meeting, demo, training..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Borrow Date</Label><Input type="date" value={form.borrowDate} onChange={e => setForm(current => ({ ...current, borrowDate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Return Date</Label><Input type="date" value={form.returnDate} onChange={e => setForm(current => ({ ...current, returnDate: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(current => ({ ...current, notes: e.target.value }))} placeholder="Additional details..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
