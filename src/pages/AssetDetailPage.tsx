import { useParams, useNavigate } from 'react-router-dom';
import { assets, getCategoryById, getDepartmentById, getUserById, getLocationById, assignments, borrowRequests, maintenanceRecords, verificationTasks, discrepancies, auditLogs } from '@/data/mock-data';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Timeline } from '@/components/Timeline';
import { Pencil, ArrowLeftRight, HandCoins, Wrench, Trash2, ArrowLeft } from 'lucide-react';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const asset = assets.find(a => a.id === id);

  if (!asset) return <div className="p-6 text-center text-muted-foreground">Asset not found</div>;

  const category = getCategoryById(asset.categoryId);
  const dept = getDepartmentById(asset.departmentId);
  const assignee = asset.assignedToId ? getUserById(asset.assignedToId) : null;
  const loc = getLocationById(asset.locationId);
  const assetAssignments = assignments.filter(a => a.assetId === asset.id);
  const assetBorrows = borrowRequests.filter(b => b.assetId === asset.id);
  const assetMaint = maintenanceRecords.filter(m => m.assetId === asset.id);
  const assetVerif = verificationTasks.filter(v => v.assetId === asset.id);
  const assetDisc = discrepancies.filter(d => d.assetId === asset.id);
  const assetLogs = auditLogs.filter(l => l.entityId === asset.id || l.entityName === asset.name).slice(0, 10);

  const info = (label: string, value: string | null | undefined) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );

  return (
    <div>
      <PageHeader title={asset.name} description={`${asset.code} · ${category?.name}`}>
        <Button size="sm" variant="ghost" onClick={() => navigate('/assets')}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
        <Button size="sm" variant="outline" onClick={() => navigate(`/assets/${asset.id}/edit`)}><Pencil className="h-4 w-4 mr-1.5" />Edit</Button>
        <Button size="sm" variant="outline" onClick={() => navigate('/assignments')}><ArrowLeftRight className="h-4 w-4 mr-1.5" />Assign</Button>
        <Button size="sm" variant="outline"><HandCoins className="h-4 w-4 mr-1.5" />Borrow</Button>
        <Button size="sm" variant="outline"><Wrench className="h-4 w-4 mr-1.5" />Maintenance</Button>
        <Button size="sm" variant="outline" className="text-destructive"><Trash2 className="h-4 w-4 mr-1.5" />Dispose</Button>
      </PageHeader>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={asset.lifecycle} />
              <StatusBadge status={asset.condition} />
              {asset.borrowable && <StatusBadge status="borrow" label="Borrowable" />}
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assignments">Assignments ({assetAssignments.length})</TabsTrigger>
                <TabsTrigger value="verification">Verification ({assetVerif.length})</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance ({assetMaint.length})</TabsTrigger>
                <TabsTrigger value="borrows">Borrows ({assetBorrows.length})</TabsTrigger>
                <TabsTrigger value="discrepancies">Discrepancies ({assetDisc.length})</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="rounded-xl"><CardContent className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                  {info('Brand', asset.brand)}
                  {info('Model', asset.model)}
                  {info('Serial Number', asset.serialNumber)}
                  {info('Purchase Date', asset.purchaseDate)}
                  {info('Purchase Price', `$${asset.purchasePrice.toLocaleString()}`)}
                  {info('Warranty Expiry', asset.warrantyExpiry)}
                  {info('Last Verified', asset.lastVerifiedDate)}
                  {info('Next Verification', asset.nextVerificationDue)}
                  {info('Notes', asset.notes || 'None')}
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="assignments">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Type</TableHead><TableHead>To</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader><TableBody>
                  {assetAssignments.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No assignments</TableCell></TableRow> :
                  assetAssignments.map(a => <TableRow key={a.id}>
                    <TableCell><StatusBadge status={a.type} /></TableCell>
                    <TableCell>{getUserById(a.toUserId)?.name}</TableCell>
                    <TableCell className="text-sm">{a.effectiveDate}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="verification">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Campaign</TableHead><TableHead>Result</TableHead><TableHead>Verified</TableHead><TableHead>Notes</TableHead>
                </TableRow></TableHeader><TableBody>
                  {assetVerif.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No verifications</TableCell></TableRow> :
                  assetVerif.map(v => <TableRow key={v.id}>
                    <TableCell className="text-sm">{v.campaignId}</TableCell>
                    <TableCell><StatusBadge status={v.result} /></TableCell>
                    <TableCell className="text-sm">{v.verifiedAt || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.notes || '—'}</TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="maintenance">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Condition</TableHead><TableHead>Date</TableHead>
                </TableRow></TableHeader><TableBody>
                  {assetMaint.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No maintenance records</TableCell></TableRow> :
                  assetMaint.map(m => <TableRow key={m.id}>
                    <TableCell className="text-sm">{m.type}</TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                    <TableCell><StatusBadge status={m.techCondition} /></TableCell>
                    <TableCell className="text-sm">{m.scheduledDate}</TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="borrows">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Requester</TableHead><TableHead>Purpose</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader><TableBody>
                  {assetBorrows.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No borrow requests</TableCell></TableRow> :
                  assetBorrows.map(b => <TableRow key={b.id}>
                    <TableCell className="text-sm">{b.requesterName}</TableCell>
                    <TableCell className="text-sm">{b.purpose}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.borrowDate} — {b.returnDate}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="discrepancies">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Type</TableHead><TableHead>Severity</TableHead><TableHead>Status</TableHead><TableHead>Expected</TableHead><TableHead>Observed</TableHead>
                </TableRow></TableHeader><TableBody>
                  {assetDisc.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No discrepancies</TableCell></TableRow> :
                  assetDisc.map(d => <TableRow key={d.id}>
                    <TableCell className="text-sm capitalize">{d.type}</TableCell>
                    <TableCell><StatusBadge status={d.severity} /></TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-sm">{d.expectedValue}</TableCell>
                    <TableCell className="text-sm">{d.observedValue}</TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="audit">
                <Card className="rounded-xl p-4">
                  <Timeline items={assetLogs.map(l => ({ id: l.id, title: `${l.actor} ${l.action.toLowerCase()}`, description: l.details, date: new Date(l.timestamp).toLocaleString() }))} />
                  {assetLogs.length === 0 && <p className="text-center py-8 text-muted-foreground">No audit logs</p>}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card className="rounded-xl">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Facts</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {info('Department', dept?.name)}
                {info('Assigned To', assignee?.name)}
                {info('Location', loc?.name)}
                {info('Category', category?.name)}
                {info('Condition', asset.condition)}
                {info('Last Verified', asset.lastVerifiedDate)}
                {info('Next Due', asset.nextVerificationDue)}
                {info('Warranty', asset.warrantyExpiry || 'N/A')}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
