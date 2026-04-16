import type { ElementType, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { api, HttpError } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: api.profile.get });
  const assetsQuery = useQuery({ queryKey: ['profile-assets'], queryFn: () => api.assets.list({ page: 0, size: 100 }) });
  const borrowQuery = useQuery({ queryKey: ['profile-borrows'], queryFn: () => api.borrowRequests.list({ page: 0, size: 100 }) });
  const notificationsQuery = useQuery({ queryKey: ['notifications'], queryFn: api.notifications.list });

  const profile = profileQuery.data ?? user;

  useEffect(() => {
    if (!profile) return;
    setForm({ phone: profile.phone ?? '', bio: profile.bio ?? '' });
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () => api.profile.update(form),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditing(false);
      toast.success('Profile updated successfully');
    },
    onError: (error) => toast.error(error instanceof HttpError ? error.message : 'Unable to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => api.auth.changePassword(passwordForm),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    },
    onError: (error) => toast.error(error instanceof HttpError ? error.message : 'Unable to change password'),
  });

  const myAssets = useMemo(
    () => (assetsQuery.data?.items ?? []).filter(asset => asset.assignedToId === profile?.id).slice(0, 5),
    [assetsQuery.data, profile?.id],
  );
  const myBorrows = useMemo(
    () => (borrowQuery.data?.items ?? []).filter(request => request.requesterId === profile?.id).slice(0, 5),
    [borrowQuery.data, profile?.id],
  );
  const myActivity = useMemo(
    () => (notificationsQuery.data ?? []).slice(0, 10),
    [notificationsQuery.data],
  );

  if (!profile) return null;

  const handleSave = () => {
    updateMutation.mutate();
  };

  const infoRow = (Icon: ElementType, label: string, value: string | ReactNode) => (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your account information and preferences" />
      <div className="p-6 space-y-6">
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  <StatusBadge status={profile.status} />
                  <Badge variant="outline" className="text-xs capitalize">{profile.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">@{profile.username} · {profile.email}</p>
                <p className="text-sm text-muted-foreground">{profile.departmentName}</p>
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
                  ) : myAssets.map(asset => (
                    <div key={asset.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.code}</p>
                        </div>
                      </div>
                      <StatusBadge status={asset.lifecycle} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader><CardTitle className="text-sm">My Borrow Requests ({myBorrows.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {myBorrows.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No borrow requests</p>
                  ) : myBorrows.map(request => (
                    <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <HandCoins className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{request.assetName}</p>
                          <p className="text-xs text-muted-foreground">{request.purpose}</p>
                        </div>
                      </div>
                      <StatusBadge status={request.status} />
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
                      <Input value={profile.name} disabled className="mt-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">Contact admin to change your name</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={profile.email} disabled className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={e => setForm(current => ({ ...current, phone: e.target.value }))} className="mt-1.5" placeholder="+1-555-0000" />
                    </div>
                    <div>
                      <Label>Bio / Notes</Label>
                      <Textarea value={form.bio} onChange={e => setForm(current => ({ ...current, bio: e.target.value }))} className="mt-1.5" placeholder="A brief note about yourself..." rows={3} />
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={updateMutation.isPending}><Save className="h-3.5 w-3.5" />Save Changes</Button>
                  </div>
                ) : (
                  <>
                    {infoRow(User, 'Full Name', profile.name)}
                    {infoRow(Mail, 'Email', profile.email)}
                    {infoRow(Phone, 'Phone', profile.phone || '—')}
                    {infoRow(Shield, 'Role', <span className="capitalize">{profile.role}</span>)}
                    {infoRow(Building2, 'Department', profile.departmentName || '—')}
                    {infoRow(MapPin, 'Location', profile.departmentName || '—')}
                    {infoRow(Calendar, 'Joined', profile.createdAt)}
                    {infoRow(Clock, 'Last Login', profile.lastLoginAt || '—')}
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
                    {myActivity.map((item, index) => (
                      <div key={item.id} className="relative flex gap-4 pb-4 last:pb-0">
                        {index < myActivity.length - 1 && <div className="absolute left-[11px] top-7 h-full w-px bg-border" />}
                        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-card">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm">{item.message}</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
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
                    <Input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(current => ({ ...current, currentPassword: e.target.value }))} placeholder="Current password" />
                    <Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(current => ({ ...current, newPassword: e.target.value }))} placeholder="New password" />
                    <Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(current => ({ ...current, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
                  </div>
                  <Button size="sm" className="mt-3 gap-1.5" onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending}><KeyRound className="h-3.5 w-3.5" />Update Password</Button>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium">Session Information</p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Last login: {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Unknown'}</p>
                    <p>Current role: {profile.role}</p>
                    <p>Department: {profile.departmentName}</p>
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
