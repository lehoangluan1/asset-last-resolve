import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { campaigns, verificationTasks } from '@/data/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartCard } from '@/components/ChartCard';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function VerificationPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const campaign = selectedCampaign ? campaigns.find(c => c.id === selectedCampaign) : null;
  const tasks = selectedCampaign ? verificationTasks.filter(t => t.campaignId === selectedCampaign) : [];
  const taskPg = usePagination(tasks);

  const chartData = campaigns.map(c => ({
    name: c.code, completed: c.completedTasks, remaining: c.totalTasks - c.completedTasks, discrepancies: c.discrepancyCount,
  }));

  return (
    <div>
      <PageHeader title="Verification Campaigns" description="Annual asset verification campaigns and tasks">
        <Button size="sm" onClick={() => toast.info('Campaign creation coming soon')}><Plus className="h-4 w-4 mr-1.5" />New Campaign</Button>
      </PageHeader>
      <div className="p-6 space-y-6">
        {!selectedCampaign ? (
          <>
            <ChartCard title="Campaign Progress" subtitle="Completed vs remaining tasks">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="completed" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="remaining" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campaigns.map(c => (
                <Card key={c.id} className="rounded-xl shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedCampaign(c.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{c.name}</CardTitle>
                      <StatusBadge status={c.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">{c.scope} · Due {c.dueDate}</div>
                    <Progress value={(c.completedTasks / c.totalTasks) * 100} className="h-2" />
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{c.completedTasks}/{c.totalTasks} tasks</span>
                      <span className="text-destructive">{c.discrepancyCount} discrepancies</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(null)}>← Back to Campaigns</Button>
            {campaign && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{campaign.name}</h2>
                  <StatusBadge status={campaign.status} />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold">{campaign.totalTasks}</p><p className="text-xs text-muted-foreground">Total Tasks</p></Card>
                  <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-success">{campaign.completedTasks}</p><p className="text-xs text-muted-foreground">Completed</p></Card>
                  <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-warning">{campaign.totalTasks - campaign.completedTasks}</p><p className="text-xs text-muted-foreground">Remaining</p></Card>
                  <Card className="rounded-xl p-4 text-center"><p className="text-2xl font-bold text-destructive">{campaign.discrepancyCount}</p><p className="text-xs text-muted-foreground">Discrepancies</p></Card>
                </div>
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Asset</TableHead><TableHead>Expected Location</TableHead><TableHead>Observed Location</TableHead><TableHead>Result</TableHead><TableHead>Verified At</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {taskPg.paginatedItems.map(t => (
                        <TableRow key={t.id} className={t.result === 'discrepancy' ? 'bg-destructive/5' : ''}>
                          <TableCell><div><p className="font-medium text-sm">{t.assetName}</p><p className="text-xs text-muted-foreground">{t.assetCode}</p></div></TableCell>
                          <TableCell className="text-sm">{t.expectedLocation}</TableCell>
                          <TableCell className={`text-sm ${t.result === 'discrepancy' ? 'text-destructive font-medium' : ''}`}>{t.observedLocation || '—'}</TableCell>
                          <TableCell><StatusBadge status={t.result} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{t.verifiedAt || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationBar page={taskPg.page} pageSize={taskPg.pageSize} totalPages={taskPg.totalPages} totalItems={taskPg.totalItems}
                    canPrev={taskPg.canPrev} canNext={taskPg.canNext} onPageChange={taskPg.setPage} onPageSizeChange={taskPg.setPageSize}
                    firstPage={taskPg.firstPage} lastPage={taskPg.lastPage} nextPage={taskPg.nextPage} prevPage={taskPg.prevPage} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
