import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { maintenanceRecords } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return maintenanceRecords.filter(m => {
      const s = !search || m.assetName.toLowerCase().includes(search.toLowerCase());
      const st = statusFilter === 'all' || m.status === statusFilter;
      return s && st;
    });
  }, [search, statusFilter]);

  const pg = usePagination(filtered);

  return (
    <div>
      <PageHeader title="Maintenance" description="Asset maintenance records and scheduling">
        <Button size="sm" onClick={() => toast.info('Add maintenance record coming soon')}><Plus className="h-4 w-4 mr-1.5" />Add Record</Button>
      </PageHeader>
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
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Asset</TableHead><TableHead>Type</TableHead><TableHead>Condition</TableHead><TableHead>Priority</TableHead><TableHead>Assigned To</TableHead><TableHead>Scheduled</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {pg.paginatedItems.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No records found</TableCell></TableRow> :
              pg.paginatedItems.map(m => (
                <TableRow key={m.id}>
                  <TableCell><div><p className="font-medium text-sm">{m.assetName}</p><p className="text-xs text-muted-foreground">{m.assetCode}</p></div></TableCell>
                  <TableCell className="text-sm">{m.type}</TableCell>
                  <TableCell><StatusBadge status={m.techCondition} /></TableCell>
                  <TableCell><StatusBadge status={m.priority} /></TableCell>
                  <TableCell className="text-sm">{m.assignedTo}</TableCell>
                  <TableCell className="text-sm">{m.scheduledDate}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
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
