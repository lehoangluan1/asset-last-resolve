import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { api, HttpError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Pencil, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole, User } from '@/types';

const emptyForm = {
  id: '',
  username: '',
  name: '',
  email: '',
  role: 'employee' as UserRole,
  departmentId: '',
  active: true,
  phone: '',
};

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const usersQuery = useQuery({
    queryKey: ['users', search, roleFilter, statusFilter, page, pageSize],
    queryFn: () => api.users.list({
      search,
      role: roleFilter === 'all' ? undefined : roleFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: page - 1,
      size: pageSize,
    }),
  });
  const departmentsQuery = useQuery({
    queryKey: ['reference', 'departments'],
    queryFn: api.reference.departments,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        username: form.username,
        name: form.name,
        email: form.email,
        role: form.role,
        departmentId: form.departmentId,
        active: form.active,
        phone: form.phone || undefined,
      };
      return form.id ? api.users.update(form.id, payload) : api.users.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(form.id ? 'User updated' : 'User registered');
      setShowDialog(false);
      setForm(emptyForm);
    },
    onError: (error) => toast.error(error instanceof HttpError ? error.message : 'Unable to save user'),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => api.users.resetPassword(id),
    onSuccess: () => toast.success('Password reset to the demo default'),
    onError: (error) => toast.error(error instanceof HttpError ? error.message : 'Unable to reset password'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.users.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: (error) => toast.error(error instanceof HttpError ? error.message : 'Unable to update status'),
  });

  const openCreate = () => { setForm(emptyForm); setShowDialog(true); };
  const openEdit = (user: User) => {
    setForm({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      active: user.status === 'active',
      phone: user.phone ?? '',
    });
    setShowDialog(true);
  };

  const data = usersQuery.data;

  return (
    <div>
      <PageHeader title="User Management" description="Manage users, roles, and access">
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" />Register User</Button>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={value => { setRoleFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {(['admin', 'officer', 'manager', 'employee', 'technician', 'auditor'] as UserRole[]).map(role => (
                <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead className="w-[50px]"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {usersQuery.isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading users...</TableCell></TableRow> :
              data?.items.length ? data.items.map(user => (
                <TableRow key={user.id}>
                  <TableCell><div><p className="font-medium text-sm">{user.name}</p><p className="text-xs text-muted-foreground">@{user.username}</p></div></TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell><StatusBadge status={user.role} label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} /></TableCell>
                  <TableCell className="text-sm">{user.departmentName}</TableCell>
                  <TableCell><StatusBadge status={user.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${user.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(user)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resetMutation.mutate(user.id)}><Lock className="h-4 w-4 mr-2" />Reset Password</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleMutation.mutate(user.id)}><Unlock className="h-4 w-4 mr-2" />Toggle Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No users found</TableCell></TableRow>}
            </TableBody>
          </Table>
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalPages={data?.totalPages ?? 1}
            totalItems={data?.totalItems ?? 0}
            canPrev={page > 1}
            canNext={page < (data?.totalPages ?? 1)}
            onPageChange={setPage}
            onPageSizeChange={size => { setPageSize(size); setPage(1); }}
            firstPage={() => setPage(1)}
            lastPage={() => setPage(data?.totalPages ?? 1)}
            nextPage={() => setPage(current => Math.min(current + 1, data?.totalPages ?? 1))}
            prevPage={() => setPage(current => Math.max(current - 1, 1))}
          />
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? 'Edit User' : 'Register New User'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} placeholder="John Doe" /></div>
              <div className="space-y-2"><Label>Username</Label><Input value={form.username} onChange={e => setForm(current => ({ ...current, username: e.target.value }))} placeholder="jdoe" /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(current => ({ ...current, email: e.target.value }))} placeholder="john@company.com" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(current => ({ ...current, phone: e.target.value }))} placeholder="+1-555-0000" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={value => setForm(current => ({ ...current, role: value as UserRole }))}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>{(['admin', 'officer', 'manager', 'employee', 'technician', 'auditor'] as UserRole[]).map(role => <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={value => setForm(current => ({ ...current, departmentId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                  <SelectContent>{departmentsQuery.data?.map(department => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.active ? 'active' : 'inactive'} onValueChange={value => setForm(current => ({ ...current, active: value === 'active' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>{form.id ? 'Save Changes' : 'Register'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
