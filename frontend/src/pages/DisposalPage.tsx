import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { api, HttpError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Search, MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function DisposalPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ['disposal', search, statusFilter, page, pageSize],
    queryFn: () => api.disposal.list({
      search,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: page - 1,
      size: pageSize,
    }),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' | 'defer' }) => {
      if (action === 'approve') return api.disposal.approve(id);
      if (action === 'reject') return api.disposal.reject(id);
      return api.disposal.defer(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disposal'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const messages = {
        approve: 'Approved',
        reject: 'Rejected',
        defer: 'Deferred',
      } as const;
      toast.success(messages[variables.action]);
    },
    onError: (error) => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to update disposal request');
    },
  });

  const data = query.data;

  return (
    <div>
      <PageHeader title="Disposal" description="Asset disposal proposals and approvals" />
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
              {['proposed', 'under-review', 'approved', 'rejected', 'deferred', 'completed'].map(status => (
                <SelectItem key={status} value={status}>{status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
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
              {query.isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading disposal requests...</TableCell></TableRow> :
              data?.items.length ? data.items.map(item => (
                <TableRow key={item.id}>
                  <TableCell><div><p className="font-medium text-sm">{item.assetName}</p><p className="text-xs text-muted-foreground">{item.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{item.reason}</TableCell>
                  <TableCell className="text-sm">{item.proposedBy}</TableCell>
                  <TableCell className="text-sm">${item.estimatedValue.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => actionMutation.mutate({ id: item.id, action: 'approve' })}><CheckCircle className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => actionMutation.mutate({ id: item.id, action: 'reject' })}><XCircle className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => actionMutation.mutate({ id: item.id, action: 'defer' })}><Clock className="h-4 w-4 mr-2" />Defer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No disposal requests</TableCell></TableRow>}
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
    </div>
  );
}
