import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Search } from 'lucide-react';
import { departments, assetCategories, users } from '@/data/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';

export default function AdminPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState('');

  const openAdd = (type: string) => { setAddType(type); setShowAdd(true); };

  return (
    <div>
      <PageHeader title="Admin / Reference Data" description="Manage system reference data and configuration"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Admin' }]} />

      <div className="p-6">
        <Tabs defaultValue="categories">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="roles">Roles & Users</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4 space-y-4">
            <div className="flex justify-between">
              <h3 className="text-sm font-semibold">Asset Categories</h3>
              <Button size="sm" onClick={() => openAdd('Category')}><Plus className="h-4 w-4 mr-1" />Add Category</Button>
            </div>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Assets</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {assetCategories.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.code}</td>
                      <td className="px-4 py-3">{c.count}</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Delete</DropdownMenuItem></DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="mt-4 space-y-4">
            <div className="flex justify-between">
              <h3 className="text-sm font-semibold">Departments</h3>
              <Button size="sm" onClick={() => openAdd('Department')}><Plus className="h-4 w-4 mr-1" />Add Department</Button>
            </div>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Manager</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Headcount</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{d.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.code}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.manager}</td>
                      <td className="px-4 py-3">{d.headCount}</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Delete</DropdownMenuItem></DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="mt-4 space-y-4">
            <h3 className="text-sm font-semibold">Users & Roles</h3>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Department</th>
                </tr></thead>
                <tbody>
                  {users.map(u => {
                    const dept = departments.find(d => d.id === u.departmentId);
                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                        <td className="px-4 py-3"><StatusBadge label={u.role.replace(/-/g, ' ')} variant="primary" /></td>
                        <td className="px-4 py-3 text-muted-foreground">{dept?.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="mt-4 space-y-4">
            <h3 className="text-sm font-semibold">Verification Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Annual Full Verification', desc: 'All departments must complete a full asset verification annually by December 31st.' },
                { title: 'Quarterly IT Audit', desc: 'IT and R&D departments undergo quarterly verification cycles.' },
                { title: 'Disposal Threshold', desc: 'Assets with condition "Not Operational" for 6+ months are flagged for disposal review.' },
                { title: 'Transfer Approval', desc: 'Cross-department transfers require manager approval from both departments.' },
              ].map((p, i) => (
                <Card key={i} className="rounded-xl shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{p.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{p.desc}</p></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add {addType}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input placeholder={`${addType} name`} /></div>
            <div className="space-y-1.5"><Label>Code</Label><Input placeholder="Short code" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => { setShowAdd(false); toast.success(`${addType} added`); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
