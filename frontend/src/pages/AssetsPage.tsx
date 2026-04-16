import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { grants } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Eye, Pencil, ArrowLeftRight } from 'lucide-react';
import type { LifecycleStatus } from '@/types';

export default function AssetsPage() {
  const navigate = useNavigate();
  const { hasGrant } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const departmentsQuery = useQuery({
    queryKey: ['reference', 'departments'],
    queryFn: api.reference.departments,
  });

  const assetsQuery = useQuery({
    queryKey: ['assets', search, statusFilter, deptFilter, page, pageSize],
    queryFn: () => api.assets.list({
      search,
      status: statusFilter === 'all' ? undefined : statusFilter,
      departmentId: deptFilter === 'all' ? undefined : deptFilter,
      page: page - 1,
      size: pageSize,
    }),
  });

  const pagination = assetsQuery.data;

  return (
    <div>
      <PageHeader title="Assets" description={`${pagination?.totalItems ?? 0} assets in your current scope`}>
        {hasGrant(grants.assetsManage) && (
          <Button size="sm" onClick={() => navigate('/assets/new')}><Plus className="h-4 w-4 mr-1.5" />Add Asset</Button>
        )}
      </PageHeader>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(['in-use', 'in-storage', 'under-maintenance', 'pending-disposal', 'disposed', 'borrowed'] as LifecycleStatus[]).map(status => (
                <SelectItem key={status} value={status}>{status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={value => { setDeptFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentsQuery.data?.map(department => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Verified</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetsQuery.isLoading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">Loading assets...</TableCell></TableRow>
              ) : pagination?.items.length ? pagination.items.map(asset => (
                <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assets/${asset.id}`)}>
                  <TableCell className="font-mono text-xs">{asset.code}</TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.categoryName}</TableCell>
                  <TableCell>{asset.departmentName}</TableCell>
                  <TableCell>{asset.assignedToName || '—'}</TableCell>
                  <TableCell>{asset.locationName}</TableCell>
                  <TableCell><StatusBadge status={asset.condition} /></TableCell>
                  <TableCell><StatusBadge status={asset.lifecycle} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{asset.lastVerifiedDate || '—'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/assets/${asset.id}`)}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                        {hasGrant(grants.assetsManage) && (
                          <DropdownMenuItem onClick={() => navigate(`/assets/${asset.id}/edit`)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        )}
                        {hasGrant(grants.assignmentsRead) && (
                          <DropdownMenuItem onClick={() => navigate('/assignments')}><ArrowLeftRight className="h-4 w-4 mr-2" />Assignments</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">No assets found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalPages={pagination?.totalPages ?? 1}
            totalItems={pagination?.totalItems ?? 0}
            canPrev={page > 1}
            canNext={page < (pagination?.totalPages ?? 1)}
            onPageChange={setPage}
            onPageSizeChange={size => { setPageSize(size); setPage(1); }}
            firstPage={() => setPage(1)}
            lastPage={() => setPage(pagination?.totalPages ?? 1)}
            nextPage={() => setPage(current => Math.min(current + 1, pagination?.totalPages ?? 1))}
            prevPage={() => setPage(current => Math.max(current - 1, 1))}
          />
        </div>
      </div>
    </div>
  );
}
