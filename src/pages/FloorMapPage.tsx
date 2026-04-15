import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { tables as initialTables } from '@/data/mock-data';
import { Users, Clock, Receipt, ShoppingCart } from 'lucide-react';
import type { RestaurantTable } from '@/types';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  available: 'border-emerald-300 bg-emerald-50',
  reserved: 'border-blue-300 bg-blue-50',
  occupied: 'border-amber-300 bg-amber-50',
  cleaning: 'border-slate-300 bg-slate-50',
  inactive: 'border-slate-200 bg-slate-100 opacity-60',
};

export default function FloorMapPage() {
  const navigate = useNavigate();
  const [tables] = useState<RestaurantTable[]>([...initialTables]);

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Floor Map</h1>
        <p className="text-sm text-muted-foreground">Visual overview of all tables</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        {(['available', 'reserved', 'occupied', 'cleaning', 'inactive'] as const).map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn('h-3 w-3 rounded-full border', statusColors[s])} />
            <span className="text-xs text-muted-foreground capitalize">{s}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map(table => (
          <Card key={table.id} className={cn('relative transition-shadow hover:shadow-md border-2', statusColors[table.status])}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">T{table.number}</span>
                <StatusBadge status={table.status} />
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> {table.capacity} seats
              </div>

              {table.status === 'occupied' && table.checkinTime && (
                <div className="flex items-center gap-1 text-xs text-amber-700">
                  <Clock className="h-3 w-3" /> Checked in {formatTime(table.checkinTime)}
                </div>
              )}

              {table.status === 'reserved' && table.reservationTime && (
                <div className="flex items-center gap-1 text-xs text-blue-700">
                  <Clock className="h-3 w-3" /> Reserved {formatTime(table.reservationTime)}
                </div>
              )}

              <div className="flex gap-1 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-7"
                  disabled={table.status !== 'occupied'}
                  onClick={() => navigate(`/orders?table=${table.id}`)}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />Order
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-7"
                  disabled={table.status !== 'occupied'}
                  onClick={() => navigate(`/billing?table=${table.id}`)}
                >
                  <Receipt className="h-3 w-3 mr-1" />Bill
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
