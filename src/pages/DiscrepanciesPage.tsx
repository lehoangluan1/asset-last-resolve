import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { severityBadge, discrepancyStatusBadge, StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, AlertTriangle, CheckCircle, ArrowLeftRight, Wrench, Trash2, HelpCircle } from 'lucide-react';
import { discrepancies, getAssetById, campaigns } from '@/data/mock-data';
import { toast } from 'sonner';

const resolutionActions = [
  { id: 'reconcile', label: 'Reconcile Records', icon: CheckCircle },
  { id: 'transfer', label: 'Transfer Asset', icon: ArrowLeftRight },
  { id: 'maintenance', label: 'Send to Maintenance', icon: Wrench },
  { id: 'dispose', label: 'Retire / Dispose', icon: Trash2 },
  { id: 'missing', label: 'Mark as Missing', icon: HelpCircle },
];

export default function DiscrepanciesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<typeof discrepancies[0] | null>(null);
  const [showResolve, setShowResolve] = useState(false);

  const filtered = discrepancies.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search) {
      const asset = getAssetById(d.assetId);
      return asset?.name.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div>
      <PageHeader title="Discrepancy Resolution Center" description={`${discrepancies.filter(d => d.status !== 'resolved').length} open discrepancies to review`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Discrepancies' }]} />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search discrepancies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Asset</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Severity</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => {
                    const asset = getAssetById(d.assetId);
                    return (
                      <tr key={d.id} className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer ${selected?.id === d.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelected(d)}>
                        <td className="px-4 py-3 font-medium">{asset?.name ?? d.assetId}</td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">{d.type.replace(/-/g, ' ')}</td>
                        <td className="px-4 py-3">{severityBadge(d.severity)}</td>
                        <td className="px-4 py-3">{discrepancyStatusBadge(d.status)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(d.reportedAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            {selected ? (
              <Card className="rounded-xl shadow-sm sticky top-20">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Discrepancy Detail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Type</span>
                    <p className="text-sm font-medium capitalize">{selected.type.replace(/-/g, ' ')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-xs text-muted-foreground">Expected</span>
                      <p className="text-sm font-medium mt-1">{selected.expectedValue}</p>
                    </div>
                    <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                      <span className="text-xs text-destructive">Observed</span>
                      <p className="text-sm font-medium mt-1">{selected.observedValue}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Severity</span>
                    <div className="mt-1">{severityBadge(selected.severity)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Status</span>
                    <div className="mt-1">{discrepancyStatusBadge(selected.status)}</div>
                  </div>
                  {selected.rootCause && (
                    <div>
                      <span className="text-xs text-muted-foreground">Root Cause</span>
                      <p className="text-sm">{selected.rootCause}</p>
                    </div>
                  )}
                  {selected.resolution && (
                    <div>
                      <span className="text-xs text-muted-foreground">Resolution</span>
                      <p className="text-sm">{selected.resolution}</p>
                    </div>
                  )}
                  {selected.status !== 'resolved' && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Resolution Actions</p>
                      <div className="space-y-1.5">
                        {resolutionActions.map(a => (
                          <Button key={a.id} variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowResolve(true)}>
                            <a.icon className="h-3.5 w-3.5 mr-2" />{a.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="flex items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground">Select a discrepancy to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showResolve} onOpenChange={setShowResolve}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolve Discrepancy</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Root Cause</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unauthorized-move">Unauthorized Move</SelectItem>
                  <SelectItem value="data-entry-error">Data Entry Error</SelectItem>
                  <SelectItem value="theft">Theft/Loss</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Resolution Notes</Label><Textarea rows={3} placeholder="Describe the resolution..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolve(false)}>Cancel</Button>
            <Button onClick={() => { setShowResolve(false); toast.success('Discrepancy resolved'); }}>Confirm Resolution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
