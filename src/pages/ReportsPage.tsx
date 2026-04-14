import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ChartCard } from '@/components/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { assets, departments, campaigns, discrepancies, maintenanceRecords, disposalRequests, auditLogs } from '@/data/mock-data';

const assetsByDept = departments.map(d => ({
  name: d.code,
  count: assets.filter(a => a.departmentId === d.id).length,
}));

const verificationRate = campaigns.map(c => ({
  name: c.code.slice(-4),
  rate: Math.round((c.completedTasks / c.totalTasks) * 100),
}));

const discrepancyTrend = [
  { month: 'Jan', count: 3 }, { month: 'Feb', count: 5 }, { month: 'Mar', count: 2 },
  { month: 'Apr', count: 4 }, { month: 'May', count: 1 }, { month: 'Jun', count: 3 },
];

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const filteredLogs = auditLogs.filter(l => {
    if (entityFilter !== 'all' && l.entityType.toLowerCase() !== entityFilter) return false;
    if (search) return l.actor.toLowerCase().includes(search.toLowerCase()) || l.entityName.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const chartStyle = { borderRadius: 8, border: '1px solid hsl(214, 32%, 91%)', fontSize: 12 };
  const tickStyle = { fontSize: 12, fill: 'hsl(215, 16%, 47%)' };

  return (
    <div>
      <PageHeader title="Reports & Audit" description="Analytics, reports, and audit trail"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Reports & Audit' }]} />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-4 space-y-6">
            {/* Report Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Assets', value: assets.length },
                { label: 'Pending Disposal', value: disposalRequests.filter(d => d.status !== 'completed' && d.status !== 'rejected').length },
                { label: 'Open Discrepancies', value: discrepancies.filter(d => d.status !== 'resolved').length },
                { label: 'Maintenance Records', value: maintenanceRecords.length },
              ].map((r, i) => (
                <Card key={i} className="rounded-xl shadow-sm">
                  <CardContent className="pt-5">
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-2xl font-bold mt-1">{r.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Assets by Department">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={assetsByDept}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="name" tick={tickStyle} /><YAxis tick={tickStyle} />
                    <Tooltip contentStyle={chartStyle} />
                    <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Verification Completion Rate (%)">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={verificationRate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="name" tick={tickStyle} /><YAxis tick={tickStyle} domain={[0, 100]} />
                    <Tooltip contentStyle={chartStyle} />
                    <Bar dataKey="rate" fill="hsl(142, 72%, 37%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Discrepancy Trends">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={discrepancyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="month" tick={tickStyle} /><YAxis tick={tickStyle} />
                    <Tooltip contentStyle={chartStyle} />
                    <Line type="monotone" dataKey="count" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Maintenance Load by Type">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={[
                    { type: 'Preventive', count: maintenanceRecords.filter(m => m.type === 'preventive').length },
                    { type: 'Corrective', count: maintenanceRecords.filter(m => m.type === 'corrective').length },
                    { type: 'Inspection', count: maintenanceRecords.filter(m => m.type === 'inspection').length },
                    { type: 'Upgrade', count: maintenanceRecords.filter(m => m.type === 'upgrade').length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="type" tick={tickStyle} /><YAxis tick={tickStyle} />
                    <Tooltip contentStyle={chartStyle} />
                    <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search audit log..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="discrepancy">Discrepancy</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="disposal">Disposal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Timestamp</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actor</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Action</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Entity</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Changes</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2.5">{log.actor}</td>
                      <td className="px-4 py-2.5"><StatusBadge label={log.action} variant="primary" /></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{log.entityType}</td>
                      <td className="px-4 py-2.5 font-medium">{log.entityName}</td>
                      <td className="px-4 py-2.5 text-xs">
                        {log.before && log.after ? (
                          <span><span className="text-destructive line-through">{log.before}</span> → <span className="text-success">{log.after}</span></span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{log.correlationId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
