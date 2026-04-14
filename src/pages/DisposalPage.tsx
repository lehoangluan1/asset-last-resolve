import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { disposalStatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';
import { disposalRequests, getAssetById } from '@/data/mock-data';
import { toast } from 'sonner';

export default function DisposalPage() {
  const [selected, setSelected] = useState<typeof disposalRequests[0] | null>(null);
  const [showReview, setShowReview] = useState(false);

  return (
    <div>
      <PageHeader title="Disposal" description="Review and approve asset disposal requests"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Disposal' }]} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Asset</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reason</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Requested By</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {disposalRequests.map(d => {
                    const asset = getAssetById(d.assetId);
                    return (
                      <tr key={d.id} className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer ${selected?.id === d.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelected(d)}>
                        <td className="px-4 py-3 font-medium">{asset?.name ?? d.assetId}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{d.reason}</td>
                        <td className="px-4 py-3">{disposalStatusBadge(d.status)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.requestedBy}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(d.requestedAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail */}
          <div>
            {selected ? (() => {
              const asset = getAssetById(selected.assetId);
              return (
                <Card className="rounded-xl shadow-sm sticky top-20">
                  <CardHeader><CardTitle className="text-sm font-semibold">Disposal Request</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><span className="text-xs text-muted-foreground">Asset</span><p className="text-sm font-medium">{asset?.name}</p></div>
                    <div><span className="text-xs text-muted-foreground">Reason</span><p className="text-sm">{selected.reason}</p></div>
                    <div><span className="text-xs text-muted-foreground">Status</span><div className="mt-1">{disposalStatusBadge(selected.status)}</div></div>
                    {asset && (
                      <div className="rounded-lg bg-warning/5 border border-warning/20 p-3">
                        <p className="text-xs font-medium text-warning mb-1">Lifecycle Impact</p>
                        <p className="text-xs text-muted-foreground">This asset was acquired on {asset.acquisitionDate} at ${asset.acquisitionCost.toLocaleString()}. Condition: {asset.condition}.</p>
                      </div>
                    )}
                    {selected.reviewedBy && (
                      <div><span className="text-xs text-muted-foreground">Reviewed By</span><p className="text-sm">{selected.reviewedBy} on {selected.reviewedAt ? new Date(selected.reviewedAt).toLocaleDateString() : '—'}</p></div>
                    )}
                    {(selected.status === 'proposed' || selected.status === 'under-review') && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" className="flex-1" onClick={() => { setShowReview(true); }}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info('Deferred')}>
                          <Clock className="h-3.5 w-3.5 mr-1" />Defer
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => toast.error('Rejected')}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })() : (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="flex items-center justify-center py-16">
                  <p className="text-sm text-muted-foreground">Select a request to review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve Disposal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-warning/5 border border-warning/20 p-3">
              <p className="text-sm text-warning font-medium flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> This action is irreversible</p>
              <p className="text-xs text-muted-foreground mt-1">The asset will be permanently marked as disposed.</p>
            </div>
            <div className="space-y-1.5"><Label>Effective Date</Label><Input type="date" /></div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={2} placeholder="Approval notes..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReview(false)}>Cancel</Button>
            <Button onClick={() => { setShowReview(false); toast.success('Disposal approved'); }}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
