import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { PaginationBar } from '@/components/PaginationBar';
import { ChartCard } from '@/components/ChartCard';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Search } from 'lucide-react';

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const summaryQuery = useQuery({ queryKey: ['report-summary'], queryFn: api.reports.summary });
  const dashboardQuery = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard.get });
  const auditQuery = useQuery({
    queryKey: ['report-audit-logs', search, page, pageSize],
    queryFn: () => api.reports.auditLogs({ search, page: page - 1, size: pageSize }),
  });
  const trendSourceQuery = useQuery({
    queryKey: ['report-audit-logs-trend'],
    queryFn: () => api.reports.auditLogs({ page: 0, size: 100 }),
  });

  const trendData = useMemo(() => {
    const grouped = new Map<string, { month: string; open: number; resolved: number }>();
    (trendSourceQuery.data?.items ?? []).forEach(log => {
      const month = new Date(log.timestamp).toLocaleString(undefined, { month: 'short' });
      if (!grouped.has(month)) {
        grouped.set(month, { month, open: 0, resolved: 0 });
      }
      const entry = grouped.get(month)!;
      if (log.action.toLowerCase().includes('resolved')) entry.resolved += 1;
      if (log.action.toLowerCase().includes('logged') || log.action.toLowerCase().includes('created')) entry.open += 1;
    });
    return Array.from(grouped.values());
  }, [trendSourceQuery.data]);

  const summary = summaryQuery.data;
  const dashboard = dashboardQuery.data;
  const auditPage = auditQuery.data;

  return (
    <div>
      <PageHeader title="Reports & Audit" description="Analytics, reports, and audit trail" />
      <div className="p-6 space-y-6">
        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="audit">Audit Log ({auditPage?.totalItems ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold">{summary?.totalAssets ?? 0}</p><p className="text-xs text-muted-foreground">Total Assets</p></Card>
              <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-destructive">{summary?.openDiscrepancies ?? 0}</p><p className="text-xs text-muted-foreground">Open Discrepancies</p></Card>
              <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-warning">{summary?.activeMaintenance ?? 0}</p><p className="text-xs text-muted-foreground">Active Maintenance</p></Card>
              <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-info">{summary?.activeBorrows ?? 0}</p><p className="text-xs text-muted-foreground">Active Borrows</p></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Assets by Department">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dashboard?.departmentDistribution ?? []}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Audit Activity Trend">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="open" stroke="hsl(var(--destructive))" strokeWidth={2} /><Line type="monotone" dataKey="resolved" stroke="hsl(var(--success))" strokeWidth={2} /></LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4 mt-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search audit logs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Name</TableHead><TableHead>Timestamp</TableHead><TableHead>Correlation ID</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {auditQuery.isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading audit logs...</TableCell></TableRow> :
                  auditPage?.items.length ? auditPage.items.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm font-medium">{log.actor}</TableCell>
                      <TableCell className="text-sm">{log.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.entityType}</TableCell>
                      <TableCell className="text-sm">{log.entityName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.correlationId}</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No audit logs found</TableCell></TableRow>}
                </TableBody>
              </Table>
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalPages={auditPage?.totalPages ?? 1}
                totalItems={auditPage?.totalItems ?? 0}
                canPrev={page > 1}
                canNext={page < (auditPage?.totalPages ?? 1)}
                onPageChange={setPage}
                onPageSizeChange={size => { setPageSize(size); setPage(1); }}
                firstPage={() => setPage(1)}
                lastPage={() => setPage(auditPage?.totalPages ?? 1)}
                nextPage={() => setPage(current => Math.min(current + 1, auditPage?.totalPages ?? 1))}
                prevPage={() => setPage(current => Math.max(current - 1, 1))}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
