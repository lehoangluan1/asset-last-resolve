import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { campaigns as seedCampaigns, verificationTasks, departments } from '@/data/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartCard } from '@/components/ChartCard';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { VerificationCampaign } from '@/types';

const emptyCampaign = {
  name: '', code: '', year: new Date().getFullYear(), scope: '',
  departmentIds: [] as string[], startDate: '', dueDate: '',
  description: '', status: 'draft' as const,
};

export default function VerificationPage() {
  const [campaignList, setCampaignList] = useState<VerificationCampaign[]>(seedCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyCampaign);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const campaign = selectedCampaign ? campaignList.find(c => c.id === selectedCampaign) : null;
  const tasks = selectedCampaign ? verificationTasks.filter(t => t.campaignId === selectedCampaign) : [];
  const taskPg = usePagination(tasks);

  const chartData = campaignList.map(c => ({
    name: c.code, completed: c.completedTasks, remaining: c.totalTasks - c.completedTasks, discrepancies: c.discrepancyCount,
  }));

  const openNew = () => { setForm(emptyCampaign); setErrors({}); setOpen(true); };

  const toggleDept = (deptId: string) => {
    setForm(p => ({
      ...p,
      departmentIds: p.departmentIds.includes(deptId)
        ? p.departmentIds.filter(d => d !== deptId)
        : [...p.departmentIds, deptId],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Campaign name is required';
    if (!form.code.trim()) e.code = 'Campaign code is required';
    if (campaignList.some(c => c.code === form.code.trim())) e.code = 'Code already exists';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    if (form.departmentIds.length === 0) e.departments = 'Select at least one department';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const selectedDepts = departments.filter(d => form.departmentIds.includes(d.id));
    const scope = form.departmentIds.length === departments.length
      ? 'All Departments'
      : selectedDepts.map(d => d.code).join(', ');
    const newCampaign: VerificationCampaign = {
      id: `camp-${Date.now()}`,
      code: form.code.trim(),
      name: form.name.trim(),
      year: form.year,
      scope,
      departmentIds: form.departmentIds,
      status: form.status,
      dueDate: form.dueDate,
      startDate: form.startDate,
      totalTasks: form.departmentIds.length * 10,
      completedTasks: 0,
      discrepancyCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaignList(prev => [...prev, newCampaign]);
    setOpen(false);
    toast.success('Verification campaign created');
  };

  return (
    <div>
      <PageHeader title="Verification Campaigns" description="Annual asset verification campaigns and tasks">
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />New Campaign</Button>
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
              {campaignList.map(c => (
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

      {/* New Campaign Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Verification Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Campaign Name <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1.5" placeholder="e.g. Q3 2025 Annual Review" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Campaign Code <span className="text-destructive">*</span></Label>
                <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="mt-1.5" placeholder="e.g. VER-2025-Q3" />
                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Year</Label>
                <Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Start Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="mt-1.5" />
                {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <Label>Due Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="mt-1.5" />
                {errors.dueDate && <p className="text-xs text-destructive mt-1">{errors.dueDate}</p>}
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as any }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Departments <span className="text-destructive">*</span></Label>
              <p className="text-xs text-muted-foreground mb-2">Select departments to include in this campaign</p>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border bg-muted/30">
                {departments.map(d => (
                  <label key={d.id} className="flex items-center gap-2 py-1 cursor-pointer">
                    <Checkbox checked={form.departmentIds.includes(d.id)} onCheckedChange={() => toggleDept(d.id)} />
                    <span className="text-sm">{d.name}</span>
                  </label>
                ))}
              </div>
              {errors.departments && <p className="text-xs text-destructive mt-1">{errors.departments}</p>}
              <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-xs" onClick={() => setForm(p => ({ ...p, departmentIds: departments.map(d => d.id) }))}>
                Select all
              </Button>
            </div>
            <div>
              <Label>Description / Instructions</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1.5" rows={3} placeholder="Instructions for verification coordinators..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
