import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { conditionBadge, lifecycleBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, ArrowLeftRight, ClipboardCheck, Wrench, AlertTriangle, MapPin, User, Building2, Calendar, DollarSign, Hash } from 'lucide-react';
import { getAssetById, getDepartmentById, getUserById, assignments, verificationTasks, maintenanceRecords, discrepancies } from '@/data/mock-data';

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const asset = getAssetById(id ?? '');

  if (!asset) return <div className="p-6">Asset not found</div>;

  const dept = getDepartmentById(asset.departmentId);
  const assignee = asset.assignedTo ? getUserById(asset.assignedTo) : null;
  const assetAssignments = assignments.filter(a => a.assetId === asset.id);
  const assetTasks = verificationTasks.filter(t => t.assetId === asset.id);
  const assetMaintenance = maintenanceRecords.filter(m => m.assetId === asset.id);
  const assetDiscrepancies = discrepancies.filter(d => d.assetId === asset.id);

  return (
    <div>
      <PageHeader title={asset.name} description={`${asset.code} · ${asset.category}`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Assets', href: '/assets' }, { label: asset.name }]}>
        <Button variant="outline" size="sm" onClick={() => navigate(`/assets/${asset.id}/edit`)}>
          <Edit className="h-4 w-4 mr-1.5" />Edit
        </Button>
        <Button variant="outline" size="sm"><ArrowLeftRight className="h-4 w-4 mr-1.5" />Transfer</Button>
        <Button size="sm"><ClipboardCheck className="h-4 w-4 mr-1.5" />Verify</Button>
      </PageHeader>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary card */}
            <Card className="rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">{conditionBadge(asset.condition)}</div>
                  <div className="flex items-center gap-2">{lifecycleBadge(asset.lifecycle)}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                  <InfoItem icon={Hash} label="Serial Number" value={asset.serialNumber} />
                  <InfoItem icon={Building2} label="Brand / Model" value={`${asset.brand} ${asset.model}`} />
                  <InfoItem icon={DollarSign} label="Acquisition Cost" value={`$${asset.acquisitionCost.toLocaleString()}`} />
                  <InfoItem icon={Calendar} label="Acquired" value={asset.acquisitionDate} />
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assignments">Assignments ({assetAssignments.length})</TabsTrigger>
                <TabsTrigger value="verification">Verification ({assetTasks.length})</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance ({assetMaintenance.length})</TabsTrigger>
                <TabsTrigger value="discrepancies">Discrepancies ({assetDiscrepancies.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem icon={Building2} label="Department" value={dept?.name ?? 'N/A'} />
                      <InfoItem icon={User} label="Assigned To" value={assignee?.name ?? 'Unassigned'} />
                      <InfoItem icon={MapPin} label="Location" value={asset.location} />
                      <InfoItem icon={Calendar} label="Last Verified" value={asset.lastVerifiedDate ?? 'Never verified'} />
                    </div>
                    {asset.notes && <div className="pt-2 border-t"><p className="text-sm text-muted-foreground">{asset.notes}</p></div>}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="assignments" className="mt-4">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="pt-6">
                    <Timeline items={assetAssignments.map(a => ({
                      id: a.id,
                      title: `${a.type === 'assign' ? 'Assigned' : a.type === 'transfer' ? 'Transferred' : 'Recalled'}`,
                      description: `To ${getUserById(a.toUserId)?.name ?? 'Unknown'} · ${getDepartmentById(a.toDepartmentId)?.name ?? ''}`,
                      date: a.effectiveDate,
                    }))} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="verification" className="mt-4">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="pt-6">
                    <Timeline items={assetTasks.map(t => ({
                      id: t.id,
                      title: `Verification ${t.status}`,
                      description: t.notes || undefined,
                      date: t.verifiedAt ? new Date(t.verifiedAt).toLocaleDateString() : 'Pending',
                    }))} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="maintenance" className="mt-4">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="pt-6">
                    <Timeline items={assetMaintenance.map(m => ({
                      id: m.id,
                      title: `${m.type} — ${m.description}`,
                      description: `Technician: ${m.technician} · Cost: $${m.cost}`,
                      date: m.completedDate ?? m.scheduledDate,
                    }))} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="discrepancies" className="mt-4">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="pt-6">
                    {assetDiscrepancies.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No discrepancies recorded</p>
                    ) : (
                      <Timeline items={assetDiscrepancies.map(d => ({
                        id: d.id,
                        title: d.type.replace(/-/g, ' '),
                        description: `Expected: ${d.expectedValue} → Observed: ${d.observedValue}`,
                        date: new Date(d.reportedAt).toLocaleDateString(),
                      }))} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Quick Facts</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <SideItem icon={User} label="Current Owner" value={assignee?.name ?? 'Unassigned'} />
                <SideItem icon={Building2} label="Department" value={dept?.name ?? 'N/A'} />
                <SideItem icon={MapPin} label="Location" value={asset.location} />
                <SideItem icon={Wrench} label="Last Maintenance" value={assetMaintenance[0]?.completedDate ?? 'None'} />
                <SideItem icon={ClipboardCheck} label="Last Verification" value={asset.lastVerifiedDate ?? 'Never'} />
                {assetDiscrepancies.length > 0 && (
                  <SideItem icon={AlertTriangle} label="Open Issues" value={`${assetDiscrepancies.filter(d => d.status !== 'resolved').length} discrepancies`} highlight />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function SideItem({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-md bg-muted p-1.5 mt-0.5"><Icon className="h-3.5 w-3.5 text-muted-foreground" /></div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}
