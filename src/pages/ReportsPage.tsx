import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { ChartCard } from '@/components/ChartCard';
import { auditLogs, assets, departments, discrepancies, maintenanceRecords, borrowRequests } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Search } from 'lucide-react';

const assetsByDept = departments.map(d => ({ name: d.code, count: assets.filter(a => a.departmentId === d.id).length }));
const discTrend = [
  { month: 'Jan', open: 3, resolved: 1 }, { month: 'Feb', open: 5, resolved: 3 },
  { month: 'Mar', open: 4, resolved: 6 }, { month: 'Apr', open: 7, resolved: 4 },
];

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const filtered = auditLogs.filter(l => !search || l.actor.toLowerCase().includes(search.toLowerCase()) || l.entityName.toLowerCase().includes(search.toLowerCase()));
  const pg = usePagination(filtered);

  return (
    <div>
      <PageHeader title="Reports & Audit" description="Analytics, reports, and audit trail" />
      <div className="p-6 space-y-6">
        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="audit">Audit Log ({auditLogs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold">{assets.length}</p><p className="text-xs text-muted-foreground">Total Assets</p></Card>
              <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-destructive">{discrepancies.filter(d => d.status !== 'resolved').length}</p><p className="text-xs text-muted-foreground">Open Discrepancies</p></Card>
              <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-warning">{maintenanceRecords.filter(m => m.status !== 'completed').length}</p><p className="text-xs text-muted-foreground">Active Maintenance</p></Card>
              <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-info">{borrowRequests.filter(b => b.status === 'checked-out').length}</p><p className="text-xs text-muted-foreground">Active Borrows</p></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Assets by Department">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={assetsByDept}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Discrepancy Trends">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={discTrend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="open" stroke="hsl(var(--destructive))" strokeWidth={2} /><Line type="monotone" dataKey="resolved" stroke="hsl(var(--success))" strokeWidth={2} /></LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4 mt-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search audit logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Name</TableHead><TableHead>Timestamp</TableHead><TableHead>Correlation ID</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {pg.paginatedItems.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm font-medium">{l.actor}</TableCell>
                      <TableCell className="text-sm">{l.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.entityType}</TableCell>
                      <TableCell className="text-sm">{l.entityName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{l.correlationId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationBar page={pg.page} pageSize={pg.pageSize} totalPages={pg.totalPages} totalItems={pg.totalItems}
                canPrev={pg.canPrev} canNext={pg.canNext} onPageChange={pg.setPage} onPageSizeChange={pg.setPageSize}
                firstPage={pg.firstPage} lastPage={pg.lastPage} nextPage={pg.nextPage} prevPage={pg.prevPage} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
