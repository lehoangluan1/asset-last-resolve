import { StatCard } from '@/components/StatCard';
import { ChartCard } from '@/components/ChartCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, CheckCircle, AlertTriangle, Wrench, Trash2, Clock, Plus, ArrowLeftRight, ClipboardCheck } from 'lucide-react';
import { assets, departments, campaigns, discrepancies, auditLogs, getDepartmentById } from '@/data/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const deptDistribution = departments.map(d => ({
  name: d.code,
  count: assets.filter(a => a.departmentId === d.id).length,
}));

const statusBreakdown = [
  { name: 'In Use', value: assets.filter(a => a.lifecycle === 'in-use').length, color: 'hsl(142, 72%, 37%)' },
  { name: 'In Storage', value: assets.filter(a => a.lifecycle === 'in-storage').length, color: 'hsl(199, 89%, 48%)' },
  { name: 'Maintenance', value: assets.filter(a => a.lifecycle === 'under-maintenance').length, color: 'hsl(32, 95%, 44%)' },
  { name: 'Pending Disposal', value: assets.filter(a => a.lifecycle === 'pending-disposal').length, color: 'hsl(0, 72%, 51%)' },
  { name: 'Disposed', value: assets.filter(a => a.lifecycle === 'disposed').length, color: 'hsl(215, 16%, 47%)' },
];

const activeCampaign = campaigns.find(c => c.status === 'active');

const recentActivity = auditLogs.slice(0, 8).map(log => ({
  id: log.id,
  title: `${log.actor} ${log.action.toLowerCase()} ${log.entityType.toLowerCase()}`,
  description: log.entityName,
  date: new Date(log.timestamp).toLocaleString(),
}));

export default function DashboardPage() {
  const navigate = useNavigate();
  const inUse = assets.filter(a => a.lifecycle === 'in-use').length;
  const dueVerification = assets.filter(a => !a.lastVerifiedDate).length;
  const withDiscrepancies = discrepancies.filter(d => d.status !== 'resolved').length;
  const underMaintenance = assets.filter(a => a.lifecycle === 'under-maintenance').length;
  const pendingDisposal = assets.filter(a => a.lifecycle === 'pending-disposal').length;

  return (
    <div>
      <PageHeader title="Dashboard" description="Organization asset overview and key metrics">
        <Button size="sm" onClick={() => navigate('/assets/new')}>
          <Plus className="h-4 w-4 mr-1.5" />Add Asset
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate('/assignments')}>
          <ArrowLeftRight className="h-4 w-4 mr-1.5" />Assign Asset
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate('/verification')}>
          <ClipboardCheck className="h-4 w-4 mr-1.5" />Launch Campaign
        </Button>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Assets" value={assets.length} icon={Box} variant="primary" subtitle="All categories" />
          <StatCard title="In Use" value={inUse} icon={CheckCircle} variant="success" trend={{ value: 2.1, label: 'vs last month' }} />
          <StatCard title="Due Verification" value={dueVerification} icon={Clock} variant="warning" />
          <StatCard title="Discrepancies" value={withDiscrepancies} icon={AlertTriangle} variant="destructive" />
          <StatCard title="Under Maintenance" value={underMaintenance} icon={Wrench} variant="info" />
          <StatCard title="Pending Disposal" value={pendingDisposal} icon={Trash2} variant="default" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Assets by Department" subtitle="Distribution across organizational units">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(214, 32%, 91%)', fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Asset Status Breakdown" subtitle="Current lifecycle distribution">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(214, 32%, 91%)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Verification Progress + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {activeCampaign && (
            <Card className="rounded-xl shadow-sm lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Active Verification Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground">{activeCampaign.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeCampaign.scope} · Due {activeCampaign.dueDate}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round((activeCampaign.completedTasks / activeCampaign.totalTasks) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(activeCampaign.completedTasks / activeCampaign.totalTasks) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{activeCampaign.completedTasks} completed</span>
                    <span>{activeCampaign.totalTasks - activeCampaign.completedTasks} remaining</span>
                    <span className="text-destructive">{activeCampaign.discrepancyCount} discrepancies</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/verification')}>
                  View Campaign
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-xl shadow-sm lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Q2 IT Verification Due', date: 'Jun 30, 2025', badge: <StatusBadge label="12 days" variant="warning" /> },
                { label: 'Laptop Refresh Review', date: 'Jul 15, 2025', badge: <StatusBadge label="27 days" variant="info" /> },
                { label: 'Annual Disposal Audit', date: 'Aug 1, 2025', badge: <StatusBadge label="44 days" variant="muted" /> },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.date}</p>
                  </div>
                  {d.badge}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm lg:col-span-1">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/reports')}>View All</Button>
            </CardHeader>
            <CardContent>
              <Timeline items={recentActivity.slice(0, 5)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
