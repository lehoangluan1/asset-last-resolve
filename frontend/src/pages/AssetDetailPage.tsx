import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Timeline } from '@/components/Timeline';
import { Pencil, ArrowLeftRight, HandCoins, Wrench, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { grants } from '@/lib/permissions';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasGrant } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['asset-detail', id],
    queryFn: () => api.assets.detail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading asset...</div>;
  }

  if (!data) {
    return <div className="p-6 text-center text-muted-foreground">Asset not found</div>;
  }

  const asset = data.asset;

  const info = (label: string, value: string | number | null | undefined) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );

  return (
    <div>
      <PageHeader title={asset.name} description={`${asset.code} · ${asset.categoryName}`}>
        <Button size="sm" variant="ghost" onClick={() => navigate('/assets')}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
        {hasGrant(grants.assetsManage) && (
          <Button size="sm" variant="outline" onClick={() => navigate(`/assets/${asset.id}/edit`)}><Pencil className="h-4 w-4 mr-1.5" />Edit</Button>
        )}
        {hasGrant(grants.assignmentsRead) && (
          <Button size="sm" variant="outline" onClick={() => navigate('/assignments')}><ArrowLeftRight className="h-4 w-4 mr-1.5" />Assign</Button>
        )}
        {hasGrant(grants.borrowsRequest) && <Button size="sm" variant="outline" onClick={() => navigate('/borrow-requests')}><HandCoins className="h-4 w-4 mr-1.5" />Borrow</Button>}
        {hasGrant(grants.maintenanceRead) && <Button size="sm" variant="outline" onClick={() => navigate('/maintenance')}><Wrench className="h-4 w-4 mr-1.5" />Maintenance</Button>}
        {hasGrant(grants.discrepanciesManage) && <Button size="sm" variant="outline" onClick={() => navigate(`/discrepancies?create=1&assetId=${asset.id}`)}><AlertTriangle className="h-4 w-4 mr-1.5" />Report Discrepancy</Button>}
        {hasGrant(grants.disposalManage) && <Button size="sm" variant="outline" className="text-destructive" onClick={() => navigate(`/disposal?create=1&assetId=${asset.id}`)}><Trash2 className="h-4 w-4 mr-1.5" />Add Disposal Item</Button>}
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
                <TabsTrigger value="assignments">Assignments ({data.assignments.length})</TabsTrigger>
                <TabsTrigger value="verification">Verification ({data.verificationTasks.length})</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance ({data.maintenanceRecords.length})</TabsTrigger>
                <TabsTrigger value="borrows">Borrows ({data.borrowRequests.length})</TabsTrigger>
                <TabsTrigger value="discrepancies">Discrepancies ({data.discrepancies.length})</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="rounded-xl"><CardContent className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                  {info('Brand', asset.brand)}
                  {info('Model', asset.model)}
                  {info('Serial Number', asset.serialNumber)}
                  {info('Purchase Date', asset.purchaseDate)}
                  {info('Purchase Price', asset.purchasePrice ? `$${asset.purchasePrice.toLocaleString()}` : null)}
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
                  {data.assignments.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No assignments</TableCell></TableRow> :
                  data.assignments.map(assignment => <TableRow key={assignment.id}>
                    <TableCell><StatusBadge status={assignment.type} /></TableCell>
                    <TableCell>{assignment.toUserName}</TableCell>
                    <TableCell className="text-sm">{assignment.effectiveDate}</TableCell>
                    <TableCell><StatusBadge status={assignment.status} /></TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="verification">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Campaign</TableHead><TableHead>Result</TableHead><TableHead>Verified</TableHead><TableHead>Notes</TableHead>
                </TableRow></TableHeader><TableBody>
                  {data.verificationTasks.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No verifications</TableCell></TableRow> :
                  data.verificationTasks.map(task => <TableRow key={task.id}>
                    <TableCell className="text-sm">{task.campaignId}</TableCell>
                    <TableCell><StatusBadge status={task.result} /></TableCell>
                    <TableCell className="text-sm">{task.verifiedAt || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{task.notes || '—'}</TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="maintenance">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Condition</TableHead><TableHead>Date</TableHead>
                </TableRow></TableHeader><TableBody>
                  {data.maintenanceRecords.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No maintenance records</TableCell></TableRow> :
                  data.maintenanceRecords.map(record => <TableRow key={record.id}>
                    <TableCell className="text-sm">{record.type}</TableCell>
                    <TableCell><StatusBadge status={record.status} /></TableCell>
                    <TableCell><StatusBadge status={record.techCondition} /></TableCell>
                    <TableCell className="text-sm">{record.scheduledDate}</TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="borrows">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Requester</TableHead><TableHead>Purpose</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader><TableBody>
                  {data.borrowRequests.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No borrow requests</TableCell></TableRow> :
                  data.borrowRequests.map(request => <TableRow key={request.id}>
                    <TableCell className="text-sm">{request.requesterName}</TableCell>
                    <TableCell className="text-sm">{request.purpose}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{request.borrowDate} — {request.returnDate}</TableCell>
                    <TableCell><StatusBadge status={request.status} /></TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="discrepancies">
                <Card className="rounded-xl overflow-hidden"><Table><TableHeader><TableRow>
                  <TableHead>Type</TableHead><TableHead>Severity</TableHead><TableHead>Status</TableHead><TableHead>Expected</TableHead><TableHead>Observed</TableHead>
                </TableRow></TableHeader><TableBody>
                  {data.discrepancies.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No discrepancies</TableCell></TableRow> :
                  data.discrepancies.map(discrepancy => <TableRow key={discrepancy.id}>
                    <TableCell className="text-sm capitalize">{discrepancy.type}</TableCell>
                    <TableCell><StatusBadge status={discrepancy.severity} /></TableCell>
                    <TableCell><StatusBadge status={discrepancy.status} /></TableCell>
                    <TableCell className="text-sm">{discrepancy.expectedValue}</TableCell>
                    <TableCell className="text-sm">{discrepancy.observedValue}</TableCell>
                  </TableRow>)}
                </TableBody></Table></Card>
              </TabsContent>

              <TabsContent value="audit">
                <Card className="rounded-xl p-4">
                  <Timeline items={data.auditLogs.map(log => ({ id: log.id, title: `${log.actor} ${log.action.toLowerCase()}`, description: log.details, date: new Date(log.timestamp).toLocaleString() }))} />
                  {data.auditLogs.length === 0 && <p className="text-center py-8 text-muted-foreground">No audit logs</p>}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card className="rounded-xl">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Facts</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {info('Department', asset.departmentName)}
                {info('Assigned To', asset.assignedToName)}
                {info('Location', asset.locationName)}
                {info('Category', asset.categoryName)}
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
