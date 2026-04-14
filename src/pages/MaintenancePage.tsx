import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { maintenanceStatusBadge, StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { maintenanceRecords, getAssetById, assets } from '@/data/mock-data';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = maintenanceRecords.filter(m => {
    if (!search) return true;
    const asset = getAssetById(m.assetId);
    return asset?.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="Maintenance" description="Track and manage asset maintenance activities"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Maintenance' }]}>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1.5" />Add Record</Button>
      </PageHeader>

      <div className="p-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search maintenance records..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Asset</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Scheduled</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Completed</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Cost</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Technician</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const asset = getAssetById(m.assetId);
                return (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{asset?.name ?? m.assetId}</td>
                    <td className="px-4 py-3"><StatusBadge label={m.type} variant="info" /></td>
                    <td className="px-4 py-3 text-muted-foreground">{m.description}</td>
                    <td className="px-4 py-3">{maintenanceStatusBadge(m.status)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.scheduledDate}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.completedDate ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">${m.cost.toFixed(0)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.technician}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Maintenance Record</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Asset</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>{assets.slice(0, 20).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Scheduled Date</Label><Input type="date" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} /></div>
            <div className="space-y-1.5"><Label>Estimated Cost</Label><Input type="number" placeholder="0.00" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => { setShowAdd(false); toast.success('Maintenance record added'); }}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
