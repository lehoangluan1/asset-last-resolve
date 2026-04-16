import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { categories as seedCategories, departments, locations } from '@/data/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import type { AssetCategory } from '@/types';

const emptyCategory: Omit<AssetCategory, 'id'> = {
  name: '', code: '', description: '', parentId: undefined,
  borrowableByDefault: false, requiresSerial: true, requiresVerification: true, status: 'active',
};

export default function AdminPage() {
  const [catList, setCatList] = useState<AssetCategory[]>(seedCategories.map(c => ({
    ...c, borrowableByDefault: false, requiresSerial: true, requiresVerification: true, status: 'active' as const,
  })));
  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState<Omit<AssetCategory, 'id'>>(emptyCategory);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openNewCat = () => { setCatForm(emptyCategory); setEditingCatId(null); setErrors({}); setCatOpen(true); };
  const openEditCat = (c: AssetCategory) => {
    setCatForm({ name: c.name, code: c.code, description: c.description, parentId: c.parentId, borrowableByDefault: c.borrowableByDefault, requiresSerial: c.requiresSerial, requiresVerification: c.requiresVerification, status: c.status });
    setEditingCatId(c.id); setErrors({}); setCatOpen(true);
  };

  const validateCat = () => {
    const e: Record<string, string> = {};
    if (!catForm.name.trim()) e.name = 'Name is required';
    if (!catForm.code.trim()) e.code = 'Code is required';
    if (catList.some(c => c.code === catForm.code.trim() && c.id !== editingCatId)) e.code = 'Code already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveCat = () => {
    if (!validateCat()) return;
    if (editingCatId) {
      setCatList(prev => prev.map(c => c.id === editingCatId ? { ...c, ...catForm, name: catForm.name.trim(), code: catForm.code.trim() } : c));
      toast.success('Category updated');
    } else {
      const newCat: AssetCategory = { ...catForm, id: `cat-${Date.now()}`, name: catForm.name.trim(), code: catForm.code.trim() };
      setCatList(prev => [...prev, newCat]);
      toast.success('Category created');
    }
    setCatOpen(false);
  };

  const deleteCat = (id: string) => {
    setCatList(prev => prev.filter(c => c.id !== id));
    toast.success('Category deleted');
  };

  return (
    <div>
      <PageHeader title="Admin / Reference Data" description="Manage categories, departments, locations, and other reference data" />
      <div className="p-6">
        <Tabs defaultValue="categories">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4">
            <Card className="rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Asset Categories</CardTitle>
                <Button size="sm" onClick={openNewCat}><Plus className="h-4 w-4 mr-1.5" />Add Category</Button>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {catList.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.code}</TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.description}</TableCell>
                      <TableCell><StatusBadge status={c.status || 'active'} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCat(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCat(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-4">
            <Card className="rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Departments</CardTitle>
                <Button size="sm" onClick={() => toast.info('Add department')}><Plus className="h-4 w-4 mr-1.5" />Add</Button>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead>Employees</TableHead></TableRow></TableHeader>
                <TableBody>
                  {departments.map(d => <TableRow key={d.id}><TableCell className="font-mono text-xs">{d.code}</TableCell><TableCell className="font-medium">{d.name}</TableCell><TableCell className="text-sm">{d.location}</TableCell><TableCell className="text-sm">{d.employeeCount}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            <Card className="rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Locations</CardTitle>
                <Button size="sm" onClick={() => toast.info('Add location')}><Plus className="h-4 w-4 mr-1.5" />Add</Button>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Building</TableHead><TableHead>Floor</TableHead><TableHead>Room</TableHead></TableRow></TableHeader>
                <TableBody>
                  {locations.map(l => <TableRow key={l.id}><TableCell className="font-medium">{l.name}</TableCell><TableCell className="text-sm">{l.building}</TableCell><TableCell className="text-sm">{l.floor}</TableCell><TableCell className="text-sm">{l.room || '—'}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCatId ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category Name <span className="text-destructive">*</span></Label>
                <Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className="mt-1.5" placeholder="e.g. Laptops" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Code <span className="text-destructive">*</span></Label>
                <Input value={catForm.code} onChange={e => setCatForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="mt-1.5" placeholder="e.g. LAP" maxLength={6} />
                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} className="mt-1.5" rows={2} placeholder="Brief description of this category" />
            </div>
            <div>
              <Label>Parent Category</Label>
              <Select value={catForm.parentId || '_none'} onValueChange={v => setCatForm(p => ({ ...p, parentId: v === '_none' ? undefined : v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None (top-level)</SelectItem>
                  {catList.filter(c => c.id !== editingCatId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={catForm.status || 'active'} onValueChange={v => setCatForm(p => ({ ...p, status: v as 'active' | 'inactive' }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <Label className="font-normal">Borrowable by default</Label>
                <Switch checked={catForm.borrowableByDefault} onCheckedChange={v => setCatForm(p => ({ ...p, borrowableByDefault: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Requires serial number</Label>
                <Switch checked={catForm.requiresSerial} onCheckedChange={v => setCatForm(p => ({ ...p, requiresSerial: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Requires verification</Label>
                <Switch checked={catForm.requiresVerification} onCheckedChange={v => setCatForm(p => ({ ...p, requiresVerification: v }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
            <Button onClick={saveCat}>{editingCatId ? 'Update' : 'Create'} Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
