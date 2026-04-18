import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/contexts/AuthContext';
import { api, HttpError } from '@/lib/api';
import { grants } from '@/lib/permissions';
import type { VerificationCampaign, VerificationTask } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartCard } from '@/components/ChartCard';
import { Plus, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

const emptyCampaign = {
  name: '',
  code: '',
  year: new Date().getFullYear(),
  departmentIds: [] as string[],
  startDate: '',
  dueDate: '',
  description: '',
  status: 'draft',
};

const taskResultOptions = [
  { value: 'matched', label: 'Verified' },
  { value: 'discrepancy', label: 'Discrepancy' },
  { value: 'missing', label: 'Missing' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'skipped', label: 'Skipped' },
];

function nextCampaignStatuses(status: VerificationCampaign['status']) {
  if (status === 'draft') return ['active', 'cancelled'];
  if (status === 'active') return ['completed', 'cancelled'];
  return [];
}

export default function VerificationPage() {
  const queryClient = useQueryClient();
  const { hasGrant } = useAuth();
  const canManageVerification = hasGrant(grants.verificationManage);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyCampaign);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusDialogCampaign, setStatusDialogCampaign] = useState<VerificationCampaign | null>(null);
  const [nextCampaignStatus, setNextCampaignStatus] = useState('');
  const [taskDialog, setTaskDialog] = useState<{ campaignId: string; task: VerificationTask } | null>(null);
  const [taskForm, setTaskForm] = useState({ result: 'matched', notes: '' });

  const campaignsQuery = useQuery({
    queryKey: ['verification-campaigns'],
    queryFn: api.verification.campaigns,
  });
  const departmentsQuery = useQuery({
    queryKey: ['reference', 'departments'],
    queryFn: api.reference.departments,
  });

  const campaigns = campaignsQuery.data ?? [];
  const campaign = selectedCampaign ? campaigns.find(item => item.id === selectedCampaign) ?? null : null;
  const taskPagination = usePagination(campaign?.tasks ?? []);
  const chartData = campaigns.map(item => ({
    name: item.code,
    completed: item.completedTasks,
    remaining: item.totalTasks - item.completedTasks,
    discrepancies: item.discrepancyCount,
  }));

  const patchCampaign = (updated: VerificationCampaign) => {
    queryClient.setQueryData<VerificationCampaign[]>(['verification-campaigns'], current =>
      current?.map(campaignItem => campaignItem.id === updated.id ? updated : campaignItem) ?? current,
    );
  };

  const createMutation = useMutation({
    mutationFn: () => api.verification.createCampaign(form),
    onSuccess: created => {
      patchCampaign(created);
      queryClient.invalidateQueries({ queryKey: ['verification-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setOpen(false);
      setForm(emptyCampaign);
      toast.success('Verification campaign created');
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to create campaign');
    },
  });

  const updateCampaignStatusMutation = useMutation({
    mutationFn: (campaignId: string) => api.verification.updateCampaignStatus(campaignId, { status: nextCampaignStatus }),
    onSuccess: updated => {
      patchCampaign(updated);
      queryClient.invalidateQueries({ queryKey: ['verification-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setStatusDialogCampaign(null);
      setNextCampaignStatus('');
      toast.success('Campaign status updated');
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to update campaign status');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: () => api.verification.updateTask(taskDialog!.campaignId, taskDialog!.task.id, {
      result: taskForm.result,
      notes: taskForm.notes || undefined,
    }),
    onSuccess: updated => {
      patchCampaign(updated);
      queryClient.invalidateQueries({ queryKey: ['verification-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      if (taskDialog?.task.assetId) {
        queryClient.invalidateQueries({ queryKey: ['asset-detail', taskDialog.task.assetId] });
      }
      setTaskDialog(null);
      setTaskForm({ result: 'matched', notes: '' });
      toast.success('Verification item updated');
    },
    onError: error => {
      toast.error(error instanceof HttpError ? error.message : 'Unable to update verification item');
    },
  });

  const openNew = () => {
    setForm(emptyCampaign);
    setErrors({});
    setOpen(true);
  };

  const toggleDept = (deptId: string) => {
    setForm(current => ({
      ...current,
      departmentIds: current.departmentIds.includes(deptId)
        ? current.departmentIds.filter(id => id !== deptId)
        : [...current.departmentIds, deptId],
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Campaign name is required';
    if (!form.code.trim()) nextErrors.code = 'Campaign code is required';
    if (!form.startDate) nextErrors.startDate = 'Start date is required';
    if (!form.dueDate) nextErrors.dueDate = 'Due date is required';
    if (form.departmentIds.length === 0) nextErrors.departments = 'Select at least one department';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const canUpdateCampaign = campaign && canManageVerification && nextCampaignStatuses(campaign.status).length > 0;
  const actionableTaskIds = useMemo(
    () => new Set((campaign?.tasks ?? []).map(task => task.id)),
    [campaign?.tasks],
  );

  return (
    <div>
      <PageHeader title="Verification Campaigns" description="Annual asset verification campaigns and tasks">
        {canManageVerification && (
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />New Campaign</Button>
        )}
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
              {campaigns.map(item => (
                <Card key={item.id} className="rounded-xl shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedCampaign(item.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{item.name}</CardTitle>
                      <StatusBadge status={item.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">{item.scope} · Due {item.dueDate}</div>
                    <Progress value={(item.completedTasks / Math.max(item.totalTasks, 1)) * 100} className="h-2" />
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{item.completedTasks}/{item.totalTasks} tasks</span>
                      <span className="text-destructive">{item.discrepancyCount} discrepancies</span>
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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{campaign.name}</h2>
                    <StatusBadge status={campaign.status} />
                  </div>
                  {canUpdateCampaign && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStatusDialogCampaign(campaign);
                        setNextCampaignStatus(nextCampaignStatuses(campaign.status)[0] ?? '');
                      }}
                    >
                      <RefreshCcw className="mr-1.5 h-4 w-4" />Update Status
                    </Button>
                  )}
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
                      <TableHead>Asset</TableHead>
                      <TableHead>Expected Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified At</TableHead>
                      <TableHead>Notes</TableHead>
                      {canManageVerification && campaign.status === 'active' && <TableHead className="w-[140px]">Action</TableHead>}
                    </TableRow></TableHeader>
                    <TableBody>
                      {taskPagination.paginatedItems.map(task => (
                        <TableRow key={task.id} className={task.result === 'discrepancy' || task.result === 'missing' || task.result === 'damaged' ? 'bg-destructive/5' : ''}>
                          <TableCell><div><p className="font-medium text-sm">{task.assetName}</p><p className="text-xs text-muted-foreground">{task.assetCode}</p></div></TableCell>
                          <TableCell className="text-sm">{task.expectedLocation}</TableCell>
                          <TableCell><StatusBadge status={task.result} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{task.verifiedAt || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{task.notes || '—'}</TableCell>
                          {canManageVerification && campaign.status === 'active' && (
                            <TableCell>
                              {actionableTaskIds.has(task.id) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setTaskDialog({ campaignId: campaign.id, task });
                                    setTaskForm({ result: task.result === 'pending' ? 'matched' : task.result, notes: task.notes || '' });
                                  }}
                                >
                                  Update Item
                                </Button>
                              ) : null}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationBar
                    page={taskPagination.page}
                    pageSize={taskPagination.pageSize}
                    totalPages={taskPagination.totalPages}
                    totalItems={taskPagination.totalItems}
                    canPrev={taskPagination.canPrev}
                    canNext={taskPagination.canNext}
                    onPageChange={taskPagination.setPage}
                    onPageSizeChange={taskPagination.setPageSize}
                    firstPage={taskPagination.firstPage}
                    lastPage={taskPagination.lastPage}
                    nextPage={taskPagination.nextPage}
                    prevPage={taskPagination.prevPage}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Verification Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Campaign Name <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} className="mt-1.5" placeholder="e.g. Q3 2026 Annual Review" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Campaign Code <span className="text-destructive">*</span></Label>
                <Input value={form.code} onChange={e => setForm(current => ({ ...current, code: e.target.value.toUpperCase() }))} className="mt-1.5" placeholder="e.g. VER-2026-Q3" />
                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Year</Label>
                <Input type="number" value={form.year} onChange={e => setForm(current => ({ ...current, year: parseInt(e.target.value, 10) || new Date().getFullYear() }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Start Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(current => ({ ...current, startDate: e.target.value }))} className="mt-1.5" />
                {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <Label>Due Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(current => ({ ...current, dueDate: e.target.value }))} className="mt-1.5" />
                {errors.dueDate && <p className="text-xs text-destructive mt-1">{errors.dueDate}</p>}
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={value => setForm(current => ({ ...current, status: value }))}>
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
                {departmentsQuery.data?.map(department => (
                  <label key={department.id} className="flex items-center gap-2 py-1 cursor-pointer">
                    <Checkbox checked={form.departmentIds.includes(department.id)} onCheckedChange={() => toggleDept(department.id)} />
                    <span className="text-sm">{department.name}</span>
                  </label>
                ))}
              </div>
              {errors.departments && <p className="text-xs text-destructive mt-1">{errors.departments}</p>}
              <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-xs" onClick={() => setForm(current => ({ ...current, departmentIds: departmentsQuery.data?.map(department => department.id) ?? [] }))}>
                Select all
              </Button>
            </div>
            <div>
              <Label>Description / Instructions</Label>
              <Textarea value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} className="mt-1.5" rows={3} placeholder="Instructions for verification coordinators..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (validate()) createMutation.mutate(); }} disabled={createMutation.isPending}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusDialogCampaign} onOpenChange={() => setStatusDialogCampaign(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Update Campaign Status</DialogTitle></DialogHeader>
          {statusDialogCampaign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Campaign</p><p className="font-medium">{statusDialogCampaign.name}</p></div>
                <div><p className="text-xs text-muted-foreground">Current Status</p><StatusBadge status={statusDialogCampaign.status} /></div>
              </div>
              <div className="space-y-2">
                <Label>Next Status</Label>
                <Select value={nextCampaignStatus} onValueChange={setNextCampaignStatus}>
                  <SelectTrigger><SelectValue placeholder="Select next status" /></SelectTrigger>
                  <SelectContent>
                    {nextCampaignStatuses(statusDialogCampaign.status).map(status => (
                      <SelectItem key={status} value={status}>{status.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusDialogCampaign(null)}>Cancel</Button>
                <Button onClick={() => updateCampaignStatusMutation.mutate(statusDialogCampaign.id)} disabled={updateCampaignStatusMutation.isPending || !nextCampaignStatus}>
                  Save Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!taskDialog} onOpenChange={() => setTaskDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Update Verification Item</DialogTitle></DialogHeader>
          {taskDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Asset</p><p className="font-medium">{taskDialog.task.assetName}</p></div>
                <div><p className="text-xs text-muted-foreground">Current Status</p><StatusBadge status={taskDialog.task.result} /></div>
                <div><p className="text-xs text-muted-foreground">Expected Location</p><p>{taskDialog.task.expectedLocation}</p></div>
                <div><p className="text-xs text-muted-foreground">Expected Assignee</p><p>{taskDialog.task.expectedAssignee || '—'}</p></div>
              </div>
              <div className="space-y-2">
                <Label>Verification Result</Label>
                <Select value={taskForm.result} onValueChange={value => setTaskForm(current => ({ ...current, result: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {taskResultOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={taskForm.notes} onChange={event => setTaskForm(current => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Add verification notes..." />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTaskDialog(null)}>Cancel</Button>
                <Button onClick={() => updateTaskMutation.mutate()} disabled={updateTaskMutation.isPending}>
                  Save Item Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
