import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { departments, assetCategories } from '@/data/mock-data';
import { toast } from 'sonner';

export default function AssetFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: '', type: '', brand: '', model: '', serialNumber: '',
    departmentId: '', location: '', condition: 'new', acquisitionDate: '', acquisitionCost: '', notes: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Asset created successfully');
    navigate('/assets');
  };

  return (
    <div>
      <PageHeader title="Add New Asset" description="Register a new asset in the system"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Assets', href: '/assets' }, { label: 'New Asset' }]} />

      <form onSubmit={handleSubmit} className="p-6 max-w-3xl space-y-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader><CardTitle className="text-sm font-semibold">Identity</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Asset Name *</Label>
              <Input placeholder="e.g. Dell Latitude 5540" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{assetCategories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Input placeholder="Sub-type" value={form.type} onChange={e => update('type', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader><CardTitle className="text-sm font-semibold">Specifications</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Brand</Label><Input value={form.brand} onChange={e => update('brand', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Model</Label><Input value={form.model} onChange={e => update('model', e.target.value)} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Serial Number</Label><Input value={form.serialNumber} onChange={e => update('serialNumber', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader><CardTitle className="text-sm font-semibold">Acquisition</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Acquisition Date</Label><Input type="date" value={form.acquisitionDate} onChange={e => update('acquisitionDate', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Cost</Label><Input type="number" placeholder="0.00" value={form.acquisitionCost} onChange={e => update('acquisitionCost', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader><CardTitle className="text-sm font-semibold">Location & Assignment</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select value={form.departmentId} onValueChange={v => update('departmentId', v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Location</Label><Input placeholder="Building, floor, room..." value={form.location} onChange={e => update('location', e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Initial Condition</Label>
              <Select value={form.condition} onValueChange={v => update('condition', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader><CardTitle className="text-sm font-semibold">Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea placeholder="Additional notes..." value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/assets')}>Cancel</Button>
          <Button type="submit">Create Asset</Button>
        </div>
      </form>
    </div>
  );
}
