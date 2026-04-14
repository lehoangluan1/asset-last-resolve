import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowRight, Search } from 'lucide-react';
import { assets, users, departments, assignments, getAssetById, getUserById, getDepartmentById } from '@/data/mock-data';
import { toast } from 'sonner';

export default function AssignmentsPage() {
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);

  const filtered = assignments.filter(a => {
    if (!search) return true;
    const asset = getAssetById(a.assetId);
    return asset?.name.toLowerCase().includes(search.toLowerCase()) || asset?.code.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="Assignments & Transfers" description="Manage asset assignments and inter-department transfers"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Assignments & Transfers' }]}>
        <Button size="sm" onClick={() => setShowConfirm(true)}>New Assignment</Button>
      </PageHeader>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Current asset state */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-xl shadow-sm">
              <CardHeader><CardTitle className="text-sm font-semibold">Selected Asset</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">Asset Code</div>
                <div className="font-mono text-primary text-sm">{selectedAsset.code}</div>
                <div className="text-xs text-muted-foreground">Name</div>
                <div className="text-sm font-medium">{selectedAsset.name}</div>
                <div className="text-xs text-muted-foreground">Current Department</div>
                <div className="text-sm">{getDepartmentById(selectedAsset.departmentId)?.name}</div>
                <div className="text-xs text-muted-foreground">Current Assignee</div>
                <div className="text-sm">{selectedAsset.assignedTo ? getUserById(selectedAsset.assignedTo)?.name : 'Unassigned'}</div>
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="text-sm">{selectedAsset.location}</div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Transfer form */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="rounded-xl shadow-sm">
              <CardHeader><CardTitle className="text-sm font-semibold">Transfer / Assignment Form</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Action Type</Label>
                    <Select defaultValue="transfer">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assign">Assign</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="recall">Recall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Effective Date</Label>
                    <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>To Department</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>To Employee</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                      <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea placeholder="Reason for transfer..." rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={() => { setShowConfirm(true); }}>
                    <ArrowRight className="h-4 w-4 mr-1.5" />Submit Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Assignment History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Asset</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Type</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">From</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">To</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Date</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 20).map(a => {
                    const asset = getAssetById(a.assetId);
                    return (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2.5 font-medium">{asset?.name ?? a.assetId}</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge label={a.type} variant={a.type === 'assign' ? 'primary' : a.type === 'transfer' ? 'info' : 'warning'} />
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{a.fromUserId ? getUserById(a.fromUserId)?.name : '—'}</td>
                        <td className="px-3 py-2.5">{getUserById(a.toUserId)?.name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{a.effectiveDate}</td>
                        <td className="px-3 py-2.5 text-muted-foreground text-xs">{a.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Transfer</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to proceed with this assignment? This action will be recorded in the audit log.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={() => { setShowConfirm(false); toast.success('Assignment completed successfully'); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
