import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationBar } from '@/components/PaginationBar';
import { usePagination } from '@/hooks/usePagination';
import { users, departments, getDepartmentById } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Pencil, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const s = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const r = roleFilter === 'all' || u.role === roleFilter;
      const st = statusFilter === 'all' || u.status === statusFilter;
      return s && r && st;
    });
  }, [search, roleFilter, statusFilter]);

  const pg = usePagination(filtered);

  return (
    <div>
      <PageHeader title="User Management" description="Manage users, roles, and access">
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />Register User</Button>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {(['admin','officer','manager','employee','technician','auditor'] as UserRole[]).map(r => (
                <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              {pg.paginatedItems.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No users found</TableCell></TableRow> :
              pg.paginatedItems.map(u => (
                <TableRow key={u.id}>
                  <TableCell><div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-muted-foreground">@{u.username}</p></div></TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell><StatusBadge status={u.role} label={u.role.charAt(0).toUpperCase() + u.role.slice(1)} /></TableCell>
                  <TableCell className="text-sm">{getDepartmentById(u.departmentId)?.code}</TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info('Edit user')}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Password reset sent')}><Lock className="h-4 w-4 mr-2" />Reset Password</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success('Status toggled')}><Unlock className="h-4 w-4 mr-2" />Toggle Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationBar page={pg.page} pageSize={pg.pageSize} totalPages={pg.totalPages} totalItems={pg.totalItems}
            canPrev={pg.canPrev} canNext={pg.canNext} onPageChange={pg.setPage} onPageSizeChange={pg.setPageSize}
            firstPage={pg.firstPage} lastPage={pg.lastPage} nextPage={pg.nextPage} prevPage={pg.prevPage} />
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register New User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input placeholder="John Doe" /></div>
              <div className="space-y-2"><Label>Username</Label><Input placeholder="jdoe" /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="john@company.com" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>{(['admin','officer','manager','employee','technician','auditor'] as UserRole[]).map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => { toast.success('User registered'); setShowCreate(false); }}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
