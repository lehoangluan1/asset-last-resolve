import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { assets, departments, categories, locations } from '@/data/mock-data';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function AssetFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const existing = id ? assets.find(a => a.id === id) : null;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name || '',
    code: existing?.code || `AST-${String(2000 + Math.floor(Math.random() * 1000))}`,
    categoryId: existing?.categoryId || '',
    departmentId: existing?.departmentId || '',
    locationId: existing?.locationId || '',
    brand: existing?.brand || '',
    model: existing?.model || '',
    serialNumber: existing?.serialNumber || '',
    purchaseDate: existing?.purchaseDate || '',
    purchasePrice: existing?.purchasePrice?.toString() || '',
    warrantyExpiry: existing?.warrantyExpiry || '',
    borrowable: existing?.borrowable || false,
    notes: existing?.notes || '',
    condition: existing?.condition || 'good',
  });

  const update = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId || !form.departmentId) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success(isEdit ? 'Asset updated successfully' : 'Asset created successfully');
    navigate('/assets');
  };

  const field = (label: string, key: string, type = 'text', required = false) => (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <Input type={type} value={(form as Record<string, unknown>)[key] as string} onChange={e => update(key, e.target.value)} />
    </div>
  );

  return (
    <div>
      <PageHeader title={isEdit ? `Edit ${existing?.name}` : 'New Asset'} description={isEdit ? `Editing ${existing?.code}` : 'Register a new asset'}>
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
              <Select value={form.categoryId} onValueChange={v => update('categoryId', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
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
              <Select value={form.departmentId} onValueChange={v => update('departmentId', v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={form.locationId} onValueChange={v => update('locationId', v)}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
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
            <div className="flex items-center gap-3">
              <Switch checked={form.borrowable} onCheckedChange={v => update('borrowable', v)} />
              <Label>Allow borrowing</Label>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit"><Save className="h-4 w-4 mr-1.5" />{isEdit ? 'Update' : 'Create'} Asset</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
