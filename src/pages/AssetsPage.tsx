import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { assets, departments, categories, users, locations, getCategoryById, getDepartmentById, getUserById, getLocationById } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Eye, Pencil, ArrowLeftRight, Download } from 'lucide-react';
import type { LifecycleStatus } from '@/types';

export default function AssetsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.lifecycle === statusFilter;
      const matchesDept = deptFilter === 'all' || a.departmentId === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [search, statusFilter, deptFilter]);

  const pagination = usePagination(filtered);

  return (
    <div>
      <PageHeader title="Assets" description={`${assets.length} assets across ${departments.length} departments`}>
        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1.5" />Export</Button>
        <Button size="sm" onClick={() => navigate('/assets/new')}><Plus className="h-4 w-4 mr-1.5" />Add Asset</Button>
      </PageHeader>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(['in-use', 'in-storage', 'under-maintenance', 'pending-disposal', 'disposed', 'borrowed'] as LifecycleStatus[]).map(s => (
                <SelectItem key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
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
              {pagination.paginatedItems.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">No assets found</TableCell></TableRow>
              ) : pagination.paginatedItems.map(asset => (
                <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assets/${asset.id}`)}>
                  <TableCell className="font-mono text-xs">{asset.code}</TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{getCategoryById(asset.categoryId)?.name}</TableCell>
                  <TableCell>{getDepartmentById(asset.departmentId)?.code}</TableCell>
                  <TableCell>{asset.assignedToId ? getUserById(asset.assignedToId)?.name : '—'}</TableCell>
                  <TableCell>{getLocationById(asset.locationId)?.name}</TableCell>
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
                        <DropdownMenuItem onClick={() => navigate(`/assets/${asset.id}/edit`)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/assignments')}><ArrowLeftRight className="h-4 w-4 mr-2" />Assign</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationBar
            page={pagination.page} pageSize={pagination.pageSize} totalPages={pagination.totalPages}
            totalItems={pagination.totalItems} canPrev={pagination.canPrev} canNext={pagination.canNext}
            onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize}
            firstPage={pagination.firstPage} lastPage={pagination.lastPage}
            nextPage={pagination.nextPage} prevPage={pagination.prevPage}
          />
        </div>
      </div>
    </div>
  );
}
