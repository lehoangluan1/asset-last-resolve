import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCircle, ChevronsUpDown, Eye, MoreHorizontal, Plus, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { PaginationBar } from '@/components/PaginationBar';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api, HttpError } from '@/lib/api';
import { grants } from '@/lib/permissions';
import type { BorrowRequest, BorrowStatus, BorrowTargetType, PageResponse } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const buildInitialForm = (targetType: BorrowTargetType, departmentId?: string) => ({
  categoryId: '',
  description: '',
  borrowDate: '',
  returnDate: '',
  notes: '',
  targetType,
  departmentId: departmentId ?? '',
});

const requestLabel = (request: BorrowRequest) => request.assetName ?? request.categoryName;
const requestReference = (request: BorrowRequest) => request.assetCode ?? request.categoryCode;
const requestTarget = (request: BorrowRequest) => request.targetType === 'department'
  ? `${request.departmentName ?? 'Department'}`
  : request.requesterName;

export default function BorrowRequestsPage() {
  const queryClient = useQueryClient();
  const { user, hasGrant } = useAuth();
  const isManager = user?.role === 'manager';
  const defaultTargetType: BorrowTargetType = isManager ? 'department' : 'individual';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState(() => buildInitialForm(defaultTargetType, user?.departmentId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryOpen, setCategoryOpen] = useState(false);

  const requestsQuery = useQuery({
    queryKey: ['borrow-requests', search, statusFilter, page, pageSize],
    queryFn: () => api.borrowRequests.list({
      search,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: page - 1,
      size: pageSize,
    }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['reference', 'categories'],
    queryFn: api.reference.categories,
  });

  const selectedCategory = useMemo(
    () => categoriesQuery.data?.find(category => category.id === form.categoryId) ?? null,
    [categoriesQuery.data, form.categoryId],
  );

  const patchBorrowRequest = (updated: BorrowRequest) => {
    queryClient.setQueriesData<PageResponse<BorrowRequest>>({ queryKey: ['borrow-requests'] }, current => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map(item => item.id === updated.id ? updated : item),
      };
    });
    if (updated.assetId) {
      queryClient.setQueryData(['asset-detail', updated.assetId], (current: any) => {
        if (!current) return current;
        return {
          ...current,
          borrowRequests: current.borrowRequests?.map((item: BorrowRequest) => item.id === updated.id ? updated : item) ?? current.borrowRequests,
        };
      });
    }
  };

  const decisionMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) => (
      decision === 'approve' ? api.borrowRequests.approve(id) : api.borrowRequests.reject(id)
    ),
    onSuccess: (updated, variables) => {
      patchBorrowRequest(updated);
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
    mutationFn: () => api.borrowRequests.create({
      categoryId: form.categoryId,
      targetType: form.targetType,
      departmentId: form.targetType === 'department' ? form.departmentId : undefined,
      borrowDate: form.borrowDate,
      returnDate: form.returnDate,
      purpose: form.description,
      notes: form.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Request submitted');
      setShowCreate(false);
      setForm(buildInitialForm(defaultTargetType, user?.departmentId));
      setErrors({});
    },
    onError: (error) => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to submit request');
    },
  });

  const data = requestsQuery.data;
  const detail = data?.items.find(request => request.id === showDetail) ?? null;

  const openCreate = () => {
    setForm(buildInitialForm(defaultTargetType, user?.departmentId));
    setErrors({});
    setShowCreate(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.categoryId) nextErrors.categoryId = 'Select a category';
    if (!form.borrowDate) nextErrors.borrowDate = 'Borrow date is required';
    if (!form.returnDate) nextErrors.returnDate = 'Return date is required';
    if (form.targetType === 'department' && !form.departmentId) nextErrors.departmentId = 'Department is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div>
      <PageHeader title="Borrow Requests" description="Category-based equipment requests and approvals">
        {hasGrant(grants.borrowsRequest) && (
          <Button size="sm" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />New Request</Button>
        )}
      </PageHeader>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search requests..." value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(['draft', 'pending-approval', 'approved', 'rejected', 'checked-out', 'returned', 'overdue', 'cancelled'] as BorrowStatus[]).map(status => (
                <SelectItem key={status} value={status}>{status.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested Item</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestsQuery.isLoading ? (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Loading requests...</TableCell></TableRow>
              ) : data?.items.length ? data.items.map(request => {
                const isPending = request.status === 'pending-approval';
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{requestLabel(request)}</p>
                        <p className="text-xs text-muted-foreground">{requestReference(request)} {request.assetId ? '· Specific asset' : '· Category request'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{request.requesterName}</TableCell>
                    <TableCell className="text-sm">
                      {request.targetType === 'department' ? `${request.departmentName ?? 'Department'} · Department` : `${requestTarget(request)} · Individual`}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm">{request.purpose}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{request.borrowDate} - {request.returnDate}</TableCell>
                    <TableCell><StatusBadge status={request.status} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${requestLabel(request)}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setShowDetail(request.id)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                          {hasGrant(grants.borrowsApprove) && isPending && (
                            <>
                              <DropdownMenuItem onClick={() => decisionMutation.mutate({ id: request.id, decision: 'approve' })}><CheckCircle className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => decisionMutation.mutate({ id: request.id, decision: 'reject' })}><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No requests found</TableCell></TableRow>
              )}
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
                <div><p className="text-xs text-muted-foreground">Requested Item</p><p className="font-medium">{requestLabel(detail)}</p></div>
                <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{detail.categoryName}</p></div>
                <div><p className="text-xs text-muted-foreground">Requested By</p><p>{detail.requesterName}</p></div>
                <div><p className="text-xs text-muted-foreground">Target</p><p>{detail.targetType === 'department' ? `${detail.departmentName} department` : detail.requesterName}</p></div>
                <div><p className="text-xs text-muted-foreground">Borrow Date</p><p>{detail.borrowDate}</p></div>
                <div><p className="text-xs text-muted-foreground">Return Date</p><p>{detail.returnDate}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Description / Requirements</p><p>{detail.purpose}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={detail.status} /></div>
                {detail.assetName && <div><p className="text-xs text-muted-foreground">Legacy Asset Reference</p><p>{detail.assetName} ({detail.assetCode})</p></div>}
              </div>
              {detail.notes && <div className="text-sm"><p className="text-xs text-muted-foreground">Notes</p><p>{detail.notes}</p></div>}
              {hasGrant(grants.borrowsApprove) && detail.status === 'pending-approval' && (
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
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New Borrow Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {isManager && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Request Target</Label>
                  <Select value={form.targetType} onValueChange={value => setForm(current => ({
                    ...current,
                    targetType: value as BorrowTargetType,
                    departmentId: value === 'department' ? (user?.departmentId ?? '') : '',
                  }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={form.targetType === 'department' ? (user?.departmentName ?? '') : 'Current requester'} readOnly />
                  {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId}</p>}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Asset Category</Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    <span className={cn('truncate', !selectedCategory && 'text-muted-foreground')}>
                      {selectedCategory ? `${selectedCategory.code} - ${selectedCategory.name}` : 'Search categories...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(420px,calc(100vw-2rem))] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Type a category name or code..." />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {categoriesQuery.data?.map(category => (
                          <CommandItem
                            key={category.id}
                            value={`${category.code} ${category.name} ${category.description}`}
                            onSelect={() => {
                              setForm(current => ({ ...current, categoryId: category.id }));
                              setCategoryOpen(false);
                            }}
                          >
                            <Check className={cn('mr-2 h-4 w-4', form.categoryId === category.id ? 'opacity-100' : 'opacity-0')} />
                            <div className="flex flex-col">
                              <span>{category.name}</span>
                              <span className="text-xs text-muted-foreground">{category.code}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description / Requirements</Label>
              <Textarea
                value={form.description}
                onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                placeholder="Describe quantity, configuration, purpose, or any special requirements..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Borrow Date</Label>
                <Input type="date" value={form.borrowDate} onChange={event => setForm(current => ({ ...current, borrowDate: event.target.value }))} />
                {errors.borrowDate && <p className="text-xs text-destructive">{errors.borrowDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>Return Date</Label>
                <Input type="date" value={form.returnDate} onChange={event => setForm(current => ({ ...current, returnDate: event.target.value }))} />
                {errors.returnDate && <p className="text-xs text-destructive">{errors.returnDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder="Optional supporting notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => { if (validate()) createMutation.mutate(); }} disabled={createMutation.isPending}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
