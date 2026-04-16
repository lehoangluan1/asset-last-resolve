import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
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
import { api, HttpError } from '@/lib/api';
import type { AssetCategory } from '@/types';

const emptyCategory: Omit<AssetCategory, 'id'> = {
  name: '',
  code: '',
  description: '',
  parentId: undefined,
  borrowableByDefault: false,
  requiresSerial: true,
  requiresVerification: true,
  status: 'active',
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ['reference', 'categories'], queryFn: api.reference.categories });
  const departmentsQuery = useQuery({ queryKey: ['reference', 'departments'], queryFn: api.reference.departments });
  const locationsQuery = useQuery({ queryKey: ['reference', 'locations'], queryFn: api.reference.locations });

  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState<Omit<AssetCategory, 'id'>>(emptyCategory);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = categoriesQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];
  const locations = locationsQuery.data ?? [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCatId) return api.reference.updateCategory(editingCatId, catForm);
      return api.reference.createCategory(catForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reference', 'categories'] });
      toast.success(editingCatId ? 'Category updated' : 'Category created');
      setCatOpen(false);
    },
    onError: (error) => toast.error(error instanceof HttpError ? error.message : 'Unable to save category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.reference.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reference', 'categories'] });
      toast.success('Category deleted');
    },
    onError: (error) => toast.error(error instanceof HttpError ? error.message : 'Unable to delete category'),
  });

  const categoryNames = useMemo(() => new Set(categories.map(category => category.code)), [categories]);

  const openNewCat = () => { setCatForm(emptyCategory); setEditingCatId(null); setErrors({}); setCatOpen(true); };
  const openEditCat = (category: AssetCategory) => {
    setCatForm({
      name: category.name,
      code: category.code,
      description: category.description,
      parentId: category.parentId,
      borrowableByDefault: category.borrowableByDefault,
      requiresSerial: category.requiresSerial,
      requiresVerification: category.requiresVerification,
      status: category.status,
    });
    setEditingCatId(category.id);
    setErrors({});
    setCatOpen(true);
  };

  const validateCat = () => {
    const nextErrors: Record<string, string> = {};
    if (!catForm.name.trim()) nextErrors.name = 'Name is required';
    if (!catForm.code.trim()) nextErrors.code = 'Code is required';
    if (categoryNames.has(catForm.code.trim()) && !editingCatId) nextErrors.code = 'Code already exists';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div>
      <PageHeader title="Admin / Reference Data" description="Manage categories and review shared reference data" />
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
                  {categories.map(category => (
                    <TableRow key={category.id}>
                      <TableCell className="font-mono text-xs">{category.code}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{category.description}</TableCell>
                      <TableCell><StatusBadge status={category.status || 'active'} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCat(category)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(category.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead>Employees</TableHead></TableRow></TableHeader>
                <TableBody>
                  {departments.map(department => <TableRow key={department.id}><TableCell className="font-mono text-xs">{department.code}</TableCell><TableCell className="font-medium">{department.name}</TableCell><TableCell className="text-sm">{department.location}</TableCell><TableCell className="text-sm">{department.employeeCount}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            <Card className="rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Locations</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Building</TableHead><TableHead>Floor</TableHead><TableHead>Room</TableHead></TableRow></TableHeader>
                <TableBody>
                  {locations.map(location => <TableRow key={location.id}><TableCell className="font-medium">{location.name}</TableCell><TableCell className="text-sm">{location.building}</TableCell><TableCell className="text-sm">{location.floor}</TableCell><TableCell className="text-sm">{location.room || '—'}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCatId ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category Name <span className="text-destructive">*</span></Label>
                <Input value={catForm.name} onChange={e => setCatForm(current => ({ ...current, name: e.target.value }))} className="mt-1.5" placeholder="e.g. Laptops" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Code <span className="text-destructive">*</span></Label>
                <Input value={catForm.code} onChange={e => setCatForm(current => ({ ...current, code: e.target.value.toUpperCase() }))} className="mt-1.5" placeholder="e.g. LAP" maxLength={6} />
                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={catForm.description} onChange={e => setCatForm(current => ({ ...current, description: e.target.value }))} className="mt-1.5" rows={2} placeholder="Brief description of this category" />
            </div>
            <div>
              <Label>Parent Category</Label>
              <Select value={catForm.parentId || '_none'} onValueChange={value => setCatForm(current => ({ ...current, parentId: value === '_none' ? undefined : value }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None (top-level)</SelectItem>
                  {categories.filter(category => category.id !== editingCatId).map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={catForm.status || 'active'} onValueChange={value => setCatForm(current => ({ ...current, status: value as 'active' | 'inactive' }))}>
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
                <Switch checked={!!catForm.borrowableByDefault} onCheckedChange={value => setCatForm(current => ({ ...current, borrowableByDefault: value }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Requires serial number</Label>
                <Switch checked={catForm.requiresSerial !== false} onCheckedChange={value => setCatForm(current => ({ ...current, requiresSerial: value }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Requires verification</Label>
                <Switch checked={catForm.requiresVerification !== false} onCheckedChange={value => setCatForm(current => ({ ...current, requiresVerification: value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (validateCat()) saveMutation.mutate(); }} disabled={saveMutation.isPending}>{editingCatId ? 'Update' : 'Create'} Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
