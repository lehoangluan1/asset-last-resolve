import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

export default function AssignmentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ['assignments', search, typeFilter, page, pageSize],
    queryFn: () => api.assignments.list({
      search,
      type: typeFilter === 'all' ? undefined : typeFilter,
      page: page - 1,
      size: pageSize,
    }),
  });

  const data = query.data;

  return (
    <div>
      <PageHeader title="Assignments & Transfers" description="Manage asset assignments, transfers, and borrow records" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={value => { setTypeFilter(value); setPage(1); }}>
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
              {query.isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading assignments...</TableCell></TableRow> :
              data?.items.length ? data.items.map(assignment => (
                <TableRow key={assignment.id}>
                  <TableCell><div><p className="font-medium text-sm">{assignment.assetName}</p><p className="text-xs text-muted-foreground">{assignment.assetCode}</p></div></TableCell>
                  <TableCell><StatusBadge status={assignment.type} /></TableCell>
                  <TableCell className="text-sm">{assignment.fromUserName || '—'}</TableCell>
                  <TableCell className="text-sm">{assignment.toUserName}</TableCell>
                  <TableCell className="text-sm">{assignment.toDepartmentCode}</TableCell>
                  <TableCell className="text-sm">{assignment.effectiveDate}</TableCell>
                  <TableCell><StatusBadge status={assignment.status} /></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No assignments found</TableCell></TableRow>}
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
