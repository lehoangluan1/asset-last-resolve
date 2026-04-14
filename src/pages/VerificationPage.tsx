import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { campaignStatusBadge, StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, ClipboardCheck, AlertTriangle, CheckCircle, Clock, MoreHorizontal, Bell } from 'lucide-react';
import { campaigns, verificationTasks, departments, assets, getDepartmentById, getUserById, getAssetById } from '@/data/mock-data';
import { conditionBadge } from '@/components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartCard } from '@/components/ChartCard';
import { toast } from 'sonner';

export default function VerificationPage() {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[1]); // active one
  const [executingTask, setExecutingTask] = useState<typeof verificationTasks[0] | null>(null);
  const [observedData, setObservedData] = useState({ location: '', condition: '', assignee: '', notes: '' });

  const campaignTasks = verificationTasks.filter(t => t.campaignId === selectedCampaign.id);
  const matched = campaignTasks.filter(t => t.status === 'matched').length;
  const disc = campaignTasks.filter(t => t.status === 'discrepancy').length;
  const pending = campaignTasks.filter(t => t.status === 'pending' || t.status === 'not-started').length;

  const chartData = [
    { name: 'Matched', value: matched, fill: 'hsl(142, 72%, 37%)' },
    { name: 'Discrepancy', value: disc, fill: 'hsl(0, 72%, 51%)' },
    { name: 'Pending', value: pending, fill: 'hsl(32, 95%, 44%)' },
  ];

  const handleSaveVerification = (markAs: 'matched' | 'discrepancy') => {
    toast.success(`Asset marked as ${markAs}`);
    setExecutingTask(null);
  };

  // Execution screen
  if (executingTask) {
    const asset = getAssetById(executingTask.assetId);
    return (
      <div>
        <PageHeader title="Verification Execution" description={`Verifying ${asset?.name ?? executingTask.assetId}`}
          breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Verification', href: '/verification' }, { label: 'Execute' }]}>
          <Button variant="outline" size="sm" onClick={() => setExecutingTask(null)}>Back to Campaign</Button>
        </PageHeader>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expected */}
            <Card className="rounded-xl shadow-sm border-l-4 border-l-primary">
              <CardHeader><CardTitle className="text-sm font-semibold text-primary">Expected State</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><span className="text-xs text-muted-foreground">Location</span><p className="text-sm font-medium">{executingTask.expectedLocation}</p></div>
                <div><span className="text-xs text-muted-foreground">Condition</span><div className="mt-1">{conditionBadge(executingTask.expectedCondition)}</div></div>
                <div><span className="text-xs text-muted-foreground">Assignee</span><p className="text-sm font-medium">{executingTask.expectedAssignee ? getUserById(executingTask.expectedAssignee)?.name : 'Unassigned'}</p></div>
              </CardContent>
            </Card>

            {/* Observed */}
            <Card className="rounded-xl shadow-sm border-l-4 border-l-warning">
              <CardHeader><CardTitle className="text-sm font-semibold text-warning">Observed State</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Location</label>
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Observed location..."
                    value={observedData.location} onChange={e => setObservedData(p => ({ ...p, location: e.target.value }))} />
                  {observedData.location && observedData.location !== executingTask.expectedLocation && (
                    <p className="text-xs text-destructive font-medium">⚠ Mismatch with expected location</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Condition</label>
                  <select className="w-full rounded-md border px-3 py-2 text-sm"
                    value={observedData.condition} onChange={e => setObservedData(p => ({ ...p, condition: e.target.value }))}>
                    <option value="">Select condition</option>
                    <option value="new">New</option><option value="good">Good</option>
                    <option value="fair">Fair</option><option value="needs-repair">Needs Repair</option>
                    <option value="not-operational">Not Operational</option>
                  </select>
                  {observedData.condition && observedData.condition !== executingTask.expectedCondition && (
                    <p className="text-xs text-destructive font-medium">⚠ Mismatch with expected condition</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={2} placeholder="Observations..."
                    value={observedData.notes} onChange={e => setObservedData(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => toast.info('Draft saved')}>Save Draft</Button>
            <Button variant="outline" className="text-success border-success hover:bg-success/10" onClick={() => handleSaveVerification('matched')}>
              <CheckCircle className="h-4 w-4 mr-1.5" />Mark as Matched
            </Button>
            <Button variant="destructive" onClick={() => handleSaveVerification('discrepancy')}>
              <AlertTriangle className="h-4 w-4 mr-1.5" />Report Discrepancy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Verification Campaigns" description="Manage annual asset verification processes"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Verification Campaigns' }]}>
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New Campaign</Button>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Campaign List */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Campaign</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Scope</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Due Date</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Progress</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Discrepancies</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer ${selectedCampaign.id === c.id ? 'bg-primary/5' : ''}`}
                  onClick={() => setSelectedCampaign(c)}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{c.code}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.scope}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.dueDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={(c.completedTasks / c.totalTasks) * 100} className="h-2 w-20" />
                      <span className="text-xs text-muted-foreground">{c.completedTasks}/{c.totalTasks}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{campaignStatusBadge(c.status)}</td>
                  <td className="px-4 py-3">
                    {c.discrepancyCount > 0 ? (
                      <StatusBadge label={`${c.discrepancyCount}`} variant="destructive" dot />
                    ) : (
                      <span className="text-xs text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminders</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Campaign Detail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{selectedCampaign.name}</h2>
            <Button variant="outline" size="sm" onClick={() => toast.info('Reminders sent')}><Bell className="h-4 w-4 mr-1.5" />Send Reminders</Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Tasks" value={selectedCampaign.totalTasks} icon={ClipboardCheck} variant="primary" />
            <StatCard title="Completed" value={selectedCampaign.completedTasks} icon={CheckCircle} variant="success" />
            <StatCard title="Pending" value={selectedCampaign.totalTasks - selectedCampaign.completedTasks} icon={Clock} variant="warning" />
            <StatCard title="Discrepancies" value={selectedCampaign.discrepancyCount} icon={AlertTriangle} variant="destructive" />
          </div>

          <ChartCard title="Verification Results" subtitle="Completed vs Pending vs Discrepancy">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(214, 32%, 91%)', fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => <Bar key={i} dataKey="value" fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Task table */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-sm font-semibold">Verification Tasks</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Asset</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Location</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Assigned To</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Status</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Verified</th>
                      <th className="w-10 px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignTasks.map(task => {
                      const asset = getAssetById(task.assetId);
                      const statusMap: Record<string, 'success' | 'destructive' | 'warning' | 'muted'> = {
                        matched: 'success', discrepancy: 'destructive', pending: 'warning', 'not-started': 'muted'
                      };
                      return (
                        <tr key={task.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2.5 font-medium">{asset?.name ?? task.assetId}</td>
                          <td className="px-3 py-2.5 text-muted-foreground text-xs">{task.expectedLocation}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{getUserById(task.assignedTo)?.name}</td>
                          <td className="px-3 py-2.5"><StatusBadge label={task.status.replace('-', ' ')} variant={statusMap[task.status]} dot /></td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">{task.verifiedAt ? new Date(task.verifiedAt).toLocaleDateString() : '—'}</td>
                          <td className="px-3 py-2.5">
                            {(task.status === 'pending' || task.status === 'not-started') && (
                              <Button size="sm" variant="outline" onClick={() => {
                                setExecutingTask(task);
                                setObservedData({ location: '', condition: '', assignee: '', notes: '' });
                              }}>Verify</Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
