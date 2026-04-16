import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { assignments, getUserById, getDepartmentById } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

export default function AssignmentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const s = !search || a.assetName.toLowerCase().includes(search.toLowerCase()) || a.assetCode.toLowerCase().includes(search.toLowerCase());
      const t = typeFilter === 'all' || a.type === typeFilter;
      return s && t;
    });
  }, [search, typeFilter]);

  const pg = usePagination(filtered);

  return (
    <div>
      <PageHeader title="Assignments & Transfers" description="Manage asset assignments, transfers, and borrow records" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
              <SelectItem value="borrow">Borrow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Department</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {pg.paginatedItems.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No assignments found</TableCell></TableRow> :
              pg.paginatedItems.map(a => (
                <TableRow key={a.id}>
                  <TableCell><div><p className="font-medium text-sm">{a.assetName}</p><p className="text-xs text-muted-foreground">{a.assetCode}</p></div></TableCell>
                  <TableCell><StatusBadge status={a.type} /></TableCell>
                  <TableCell className="text-sm">{a.fromUserId ? getUserById(a.fromUserId)?.name : '—'}</TableCell>
                  <TableCell className="text-sm">{getUserById(a.toUserId)?.name}</TableCell>
                  <TableCell className="text-sm">{getDepartmentById(a.toDepartmentId)?.code}</TableCell>
                  <TableCell className="text-sm">{a.effectiveDate}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
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
