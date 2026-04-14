import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { conditionBadge, lifecycleBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Download, MoreHorizontal, Filter, X } from 'lucide-react';
import { assets, departments, getDepartmentById, getUserById } from '@/data/mock-data';
import type { AssetLifecycle } from '@/types';

const lifecycleFilters: { label: string; value: AssetLifecycle | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Use', value: 'in-use' },
  { label: 'In Storage', value: 'in-storage' },
  { label: 'Under Maintenance', value: 'under-maintenance' },
  { label: 'Pending Disposal', value: 'pending-disposal' },
  { label: 'Disposed', value: 'disposed' },
];

export default function AssetsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return assets.filter(a => {
      if (lifecycleFilter !== 'all' && a.lifecycle !== lifecycleFilter) return false;
      if (departmentFilter !== 'all' && a.departmentId !== departmentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, lifecycleFilter, departmentFilter]);

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(a => a.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  return (
    <div>
      <PageHeader title="Assets" description={`${assets.length} assets across ${departments.length} departments`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Assets' }]}>
        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1.5" />Export</Button>
        <Button size="sm" onClick={() => navigate('/assets/new')}><Plus className="h-4 w-4 mr-1.5" />Add Asset</Button>
      </PageHeader>

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by code, name, category..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9" />
          </div>
          <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {lifecycleFilters.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {(search || lifecycleFilter !== 'all' || departmentFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setLifecycleFilter('all'); setDepartmentFilter('all'); }}>
              <X className="h-3.5 w-3.5 mr-1" />Clear
            </Button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button variant="outline" size="sm">Bulk Assign</Button>
            <Button variant="outline" size="sm">Bulk Transfer</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="w-10 px-3 py-3"><Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Code</th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Name</th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Category</th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Department</th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Assigned To</th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Location</th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Condition</th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Last Verified</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(asset => {
                  const dept = getDepartmentById(asset.departmentId);
                  const user = asset.assignedTo ? getUserById(asset.assignedTo) : null;
                  return (
                    <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/assets/${asset.id}`)}>
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.has(asset.id)} onCheckedChange={() => toggleOne(asset.id)} />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-primary">{asset.code}</td>
                      <td className="px-3 py-2.5 font-medium">{asset.name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{asset.category}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{dept?.code}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{user?.name ?? '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{asset.location}</td>
                      <td className="px-3 py-2.5">{conditionBadge(asset.condition)}</td>
                      <td className="px-3 py-2.5">{lifecycleBadge(asset.lifecycle)}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{asset.lastVerifiedDate ?? 'Never'}</td>
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/assets/${asset.id}`)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/assets/${asset.id}/edit`)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Assign</DropdownMenuItem>
                            <DropdownMenuItem>Transfer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
            <span>Showing {filtered.length} of {assets.length} assets</span>
          </div>
        </div>
      </div>
    </div>
  );
}
