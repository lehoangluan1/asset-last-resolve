import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Building2, MapPin, Calendar, Shield, Clock, Edit2, Save, KeyRound, Box, HandCoins } from 'lucide-react';
import { departments, assets, borrowRequests, auditLogs } from '@/data/mock-data';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: user?.phone || '', notes: '' });

  if (!user) return null;

  const dept = departments.find(d => d.id === user.departmentId);
  const myAssets = assets.filter(a => a.assignedToId === user.id).slice(0, 5);
  const myBorrows = borrowRequests.filter(b => b.requesterId === user.id).slice(0, 5);
  const myActivity = auditLogs.filter(l => l.actor === user.name).slice(0, 10);

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const infoRow = (icon: React.ElementType, label: string, value: string | React.ReactNode) => {
    const Icon = icon;
    return (
      <div className="flex items-start gap-3 py-2.5">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="text-sm font-medium">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your account information and preferences" />
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <StatusBadge status={user.status} />
                  <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">@{user.username} · {user.email}</p>
                <p className="text-sm text-muted-foreground">{dept?.name || 'Unknown Department'} · {dept?.location}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(!editing)}>
                <Edit2 className="h-3.5 w-3.5" />{editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="account">Account Info</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="rounded-xl">
                <CardHeader><CardTitle className="text-sm">Assigned Assets ({myAssets.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {myAssets.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No assets assigned</p>
                  ) : myAssets.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.code}</p>
                        </div>
                      </div>
                      <StatusBadge status={a.lifecycle} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader><CardTitle className="text-sm">My Borrow Requests ({myBorrows.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {myBorrows.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No borrow requests</p>
                  ) : myBorrows.map(b => (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <HandCoins className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{b.assetName}</p>
                          <p className="text-xs text-muted-foreground">{b.purpose}</p>
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-4">
            <Card className="rounded-xl">
              <CardContent className="pt-6 space-y-1 max-w-lg">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={user.name} disabled className="mt-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">Contact admin to change your name</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={user.email} disabled className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="mt-1.5" placeholder="+1-555-0000" />
                    </div>
                    <div>
                      <Label>Bio / Notes</Label>
                      <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mt-1.5" placeholder="A brief note about yourself..." rows={3} />
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={handleSave}><Save className="h-3.5 w-3.5" />Save Changes</Button>
                  </div>
                ) : (
                  <>
                    {infoRow(User, 'Full Name', user.name)}
                    {infoRow(Mail, 'Email', user.email)}
                    {infoRow(Phone, 'Phone', user.phone || '—')}
                    {infoRow(Shield, 'Role', <span className="capitalize">{user.role}</span>)}
                    {infoRow(Building2, 'Department', dept?.name || '—')}
                    {infoRow(MapPin, 'Location', dept?.location || '—')}
                    {infoRow(Calendar, 'Joined', user.createdAt)}
                    {infoRow(Clock, 'Last Login', 'Today at 9:15 AM')}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card className="rounded-xl">
              <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
              <CardContent>
                {myActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
                ) : (
                  <div className="space-y-0">
                    {myActivity.map((log, i) => (
                      <div key={log.id} className="relative flex gap-4 pb-4 last:pb-0">
                        {i < myActivity.length - 1 && <div className="absolute left-[11px] top-7 h-full w-px bg-border" />}
                        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-card">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm">{log.details}</p>
                          <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card className="rounded-xl">
              <CardHeader><CardTitle className="text-sm">Security Settings</CardTitle></CardHeader>
              <CardContent className="space-y-6 max-w-lg">
                <div>
                  <Label>Change Password</Label>
                  <div className="space-y-2 mt-2">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button size="sm" className="mt-3 gap-1.5"><KeyRound className="h-3.5 w-3.5" />Update Password</Button>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium">Session Information</p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Current session started: Today at 9:15 AM</p>
                    <p>IP Address: 192.168.1.100</p>
                    <p>Browser: Chrome 124</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-4">
            <Card className="rounded-xl">
              <CardHeader><CardTitle className="text-sm">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                {[
                  'Borrow request updates',
                  'Verification assignments',
                  'Asset transfer notifications',
                  'Maintenance alerts',
                  'Discrepancy alerts',
                  'System announcements',
                ].map(label => (
                  <div key={label} className="flex items-center justify-between">
                    <Label className="font-normal">{label}</Label>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
