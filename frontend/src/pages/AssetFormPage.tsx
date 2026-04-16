import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, HttpError } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

const createDefaultCode = () => `AST-${String(2000 + Math.floor(Math.random() * 7000))}`;

export default function AssetFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const assetQuery = useQuery({
    queryKey: ['asset-detail', id],
    queryFn: () => api.assets.detail(id!),
    enabled: isEdit,
  });
  const departmentsQuery = useQuery({ queryKey: ['reference', 'departments'], queryFn: api.reference.departments });
  const categoriesQuery = useQuery({ queryKey: ['reference', 'categories'], queryFn: api.reference.categories });
  const locationsQuery = useQuery({ queryKey: ['reference', 'locations'], queryFn: api.reference.locations });

  const [form, setForm] = useState({
    name: '',
    code: createDefaultCode(),
    categoryId: '',
    departmentId: '',
    locationId: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiry: '',
    borrowable: false,
    notes: '',
    condition: 'good',
    description: '',
  });

  useEffect(() => {
    const asset = assetQuery.data?.asset;
    if (!asset) return;
    setForm({
      name: asset.name,
      code: asset.code,
      categoryId: asset.categoryId,
      departmentId: asset.departmentId,
      locationId: asset.locationId,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate ?? '',
      purchasePrice: asset.purchasePrice?.toString() ?? '',
      warrantyExpiry: asset.warrantyExpiry ?? '',
      borrowable: asset.borrowable,
      notes: asset.notes,
      condition: asset.condition,
      description: asset.description,
    });
  }, [assetQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
      };
      if (isEdit && id) {
        return api.assets.update(id, payload);
      }
      return api.assets.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['asset-detail', id] });
      }
      toast.success(isEdit ? 'Asset updated successfully' : 'Asset created successfully');
      navigate('/assets');
    },
    onError: (error) => {
      const message = error instanceof HttpError ? error.message : 'Unable to save asset';
      toast.error(message);
    },
  });

  const update = (key: string, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId || !form.departmentId || !form.locationId) {
      toast.error('Please fill in all required fields');
      return;
    }
    mutation.mutate();
  };

  const field = (label: string, key: keyof typeof form, type = 'text', required = false) => (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <Input type={type} value={form[key] as string} onChange={e => update(key, e.target.value)} />
    </div>
  );

  if (isEdit && assetQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading asset...</div>;
  }

  return (
    <div>
      <PageHeader title={isEdit ? `Edit ${assetQuery.data?.asset.name ?? 'Asset'}` : 'New Asset'} description={isEdit ? `Editing ${assetQuery.data?.asset.code ?? ''}` : 'Register a new asset'}>
        <Button size="sm" variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
      </PageHeader>
      <form onSubmit={handleSubmit} className="p-6 max-w-4xl space-y-6">
        <Card className="rounded-xl">
          <CardHeader><CardTitle className="text-sm">Identity</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Asset Name', 'name', 'text', true)}
            {field('Asset Code', 'code', 'text', true)}
            <div className="space-y-2">
              <Label>Category<span className="text-destructive ml-0.5">*</span></Label>
              <Select value={form.categoryId} onValueChange={value => update('categoryId', value)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categoriesQuery.data?.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {field('Brand', 'brand')}
            {field('Model', 'model')}
            {field('Serial Number', 'serialNumber')}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader><CardTitle className="text-sm">Ownership & Location</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department<span className="text-destructive ml-0.5">*</span></Label>
              <Select value={form.departmentId} onValueChange={value => update('departmentId', value)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departmentsQuery.data?.map(department => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location<span className="text-destructive ml-0.5">*</span></Label>
              <Select value={form.locationId} onValueChange={value => update('locationId', value)}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>{locationsQuery.data?.map(location => <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader><CardTitle className="text-sm">Procurement</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {field('Purchase Date', 'purchaseDate', 'date')}
            {field('Purchase Price', 'purchasePrice', 'number')}
            {field('Warranty Expiry', 'warrantyExpiry', 'date')}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader><CardTitle className="text-sm">Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={form.condition} onValueChange={value => update('condition', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="non-functional">Non-functional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.borrowable} onCheckedChange={value => update('borrowable', value)} />
              <Label>Allow borrowing</Label>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}><Save className="h-4 w-4 mr-1.5" />{mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'} Asset</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
