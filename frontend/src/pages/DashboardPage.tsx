import type { ElementType } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/StatCard';
import { ChartCard } from '@/components/ChartCard';
import { Timeline } from '@/components/Timeline';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, CheckCircle, AlertTriangle, Wrench, Trash2, Clock, Plus, ArrowLeftRight, ClipboardCheck, HandCoins, TimerOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { grants } from '@/lib/permissions';

const statIcons: Record<string, ElementType> = {
  'total-assets': Box,
  'in-use': CheckCircle,
  'due-verification': Clock,
  discrepancies: AlertTriangle,
  maintenance: Wrench,
  'pending-disposal': Trash2,
  'active-borrows': HandCoins,
  'overdue-returns': TimerOff,
};

const pieColors = ['hsl(142, 72%, 37%)', 'hsl(199, 89%, 48%)', 'hsl(32, 95%, 44%)', 'hsl(0, 72%, 51%)', 'hsl(215, 16%, 47%)', 'hsl(188, 94%, 43%)'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { hasGrant, user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard.get,
  });

  if (isLoading || !data) {
    return <div className="p-6 text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div>
      <PageHeader title="Dashboard" description={`Role-aware overview for ${user?.departmentName ?? 'your scope'}`}>
        {hasGrant(grants.assetsManage) && (
          <Button size="sm" onClick={() => navigate('/assets/new')}><Plus className="h-4 w-4 mr-1.5" />Add Asset</Button>
        )}
        {hasGrant(grants.assignmentsRead) && (
          <Button size="sm" variant="outline" onClick={() => navigate('/assignments')}><ArrowLeftRight className="h-4 w-4 mr-1.5" />Assignments</Button>
        )}
        {hasGrant(grants.borrowsRead) && (
          <Button size="sm" variant="outline" onClick={() => navigate('/borrow-requests')}><HandCoins className="h-4 w-4 mr-1.5" />Borrow</Button>
        )}
        {hasGrant(grants.verificationRead) && (
          <Button size="sm" variant="outline" onClick={() => navigate('/verification')}><ClipboardCheck className="h-4 w-4 mr-1.5" />Campaign</Button>
        )}
      </PageHeader>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {data.stats.map(stat => {
            const Icon = statIcons[stat.key] ?? Box;
            return (
              <StatCard
                key={stat.key}
                title={stat.label}
                value={stat.value}
                icon={Icon}
                variant={stat.variant as any}
                subtitle={stat.subtitle ?? undefined}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Assets by Department" subtitle="Distribution across your visible scope">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Asset Status Breakdown" subtitle="Lifecycle distribution">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.statusBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {data.statusBreakdown.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {data.activeCampaign && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Active Verification Campaign</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground">{data.activeCampaign.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{data.activeCampaign.scope} · Due {data.activeCampaign.dueDate}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round((data.activeCampaign.completedTasks / Math.max(data.activeCampaign.totalTasks, 1)) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(data.activeCampaign.completedTasks / Math.max(data.activeCampaign.totalTasks, 1)) * 100}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{data.activeCampaign.completedTasks} completed</span>
                    <span>{data.activeCampaign.totalTasks - data.activeCampaign.completedTasks} remaining</span>
                    <span className="text-destructive">{data.activeCampaign.discrepancyCount} discrepancies</span>
                  </div>
                </div>
                {hasGrant(grants.verificationRead) && (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/verification')}>View Campaign</Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Upcoming Deadlines</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              ) : data.upcomingDeadlines.map((deadline, index) => (
                <div key={`${deadline.label}-${index}`} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{deadline.label}</p>
                    <p className="text-xs text-muted-foreground">{deadline.date}</p>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">{deadline.status.replace(/-/g, ' ')}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              {hasGrant(grants.reportsRead) && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/reports')}>View All</Button>
              )}
            </CardHeader>
            <CardContent>
              <Timeline items={data.recentActivity.slice(0, 5).map(log => ({
                id: log.id,
                title: `${log.actor} ${log.action.toLowerCase()}`,
                description: log.entityName,
                date: new Date(log.timestamp).toLocaleString(),
              }))} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
