import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { NotificationDialog } from '@/components/NotificationDialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Send, UserCheck, Phone, Mail, CalendarDays, Clock, Users } from 'lucide-react';
import type { Reservation, RestaurantTable, WaitingListEntry, ReservationStatus, WaitingStatus } from '@/types';
import { tables as initialTables, reservations as initialReservations, waitingList as initialWaitingList } from '@/data/mock-data';

export default function ReservationsPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([...initialTables]);
  const [reservations, setReservations] = useState<Reservation[]>([...initialReservations]);
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([...initialWaitingList]);
  const [tab, setTab] = useState('new');

  // New Reservation form
  const [newRes, setNewRes] = useState({ customerName: '', phone: '', email: '', date: '', time: '', guests: '', notes: '' });
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Table CRUD
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableForm, setTableForm] = useState({ number: '', capacity: '', notes: '' });
  const [deleteTableConfirm, setDeleteTableConfirm] = useState<RestaurantTable | null>(null);

  // Reservation edit
  const [editResOpen, setEditResOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  const [editResForm, setEditResForm] = useState({ guests: '', notes: '' });

  // Notification
  const [notifTarget, setNotifTarget] = useState<{ name: string; phone: string } | null>(null);

  // Waiting list
  const [wlDialogOpen, setWlDialogOpen] = useState(false);
  const [wlForm, setWlForm] = useState({ customerName: '', phone: '', guests: '', notes: '' });

  const availableTables = tables.filter(t => {
    if (t.status !== 'available') return false;
    const guestCount = parseInt(newRes.guests);
    if (guestCount && t.capacity < guestCount) return false;
    return true;
  });

  const validateNewRes = () => {
    const errors: Record<string, string> = {};
    if (!newRes.customerName.trim()) errors.customerName = 'Required';
    if (!newRes.phone.trim()) errors.phone = 'Required';
    if (!newRes.date) errors.date = 'Required';
    if (!newRes.time) errors.time = 'Required';
    if (!newRes.guests || parseInt(newRes.guests) < 1) errors.guests = 'At least 1';
    if (!selectedTableId) errors.table = 'Select a table';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmReservation = () => {
    if (!validateNewRes()) return;
    const table = tables.find(t => t.id === selectedTableId)!;
    const res: Reservation = {
      id: `res-${Date.now()}`, customerName: newRes.customerName, phone: newRes.phone,
      email: newRes.email, date: newRes.date, time: newRes.time, guests: parseInt(newRes.guests),
      tableId: table.id, tableNumber: table.number, status: 'confirmed',
      notes: newRes.notes, createdAt: new Date().toISOString(),
    };
    setReservations(prev => [res, ...prev]);
    setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, status: 'reserved' as const, currentReservationId: res.id, reservationTime: `${newRes.date}T${newRes.time}:00` } : t));
    setNewRes({ customerName: '', phone: '', email: '', date: '', time: '', guests: '', notes: '' });
    setSelectedTableId(null);
    setFormErrors({});
    toast.success('Reservation confirmed');
    setTab('today');
  };

  const updateResStatus = (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (status === 'checked-in') {
      const res = reservations.find(r => r.id === id);
      if (res?.tableId) {
        setTables(prev => prev.map(t => t.id === res.tableId ? { ...t, status: 'occupied' as const, checkinTime: new Date().toISOString() } : t));
      }
    }
    toast.success(`Reservation ${status.replace('-', ' ')}`);
  };

  const handleEditRes = () => {
    if (!editingRes) return;
    setReservations(prev => prev.map(r => r.id === editingRes.id ? { ...r, guests: parseInt(editResForm.guests) || r.guests, notes: editResForm.notes } : r));
    setEditResOpen(false);
    toast.success('Reservation updated');
  };

  // Table CRUD handlers
  const openTableDialog = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table);
      setTableForm({ number: String(table.number), capacity: String(table.capacity), notes: table.notes });
    } else {
      setEditingTable(null);
      setTableForm({ number: '', capacity: '', notes: '' });
    }
    setTableDialogOpen(true);
  };

  const saveTable = () => {
    if (!tableForm.number || !tableForm.capacity) { toast.error('Fill required fields'); return; }
    if (editingTable) {
      setTables(prev => prev.map(t => t.id === editingTable.id ? { ...t, number: parseInt(tableForm.number), capacity: parseInt(tableForm.capacity), notes: tableForm.notes } : t));
      toast.success('Table updated');
    } else {
      const newTable: RestaurantTable = {
        id: `t-${Date.now()}`, number: parseInt(tableForm.number), capacity: parseInt(tableForm.capacity),
        status: 'available', notes: tableForm.notes, currentOrderId: null, currentReservationId: null, checkinTime: null, reservationTime: null,
      };
      setTables(prev => [...prev, newTable]);
      toast.success('Table added');
    }
    setTableDialogOpen(false);
  };

  const deleteTable = () => {
    if (!deleteTableConfirm) return;
    setTables(prev => prev.filter(t => t.id !== deleteTableConfirm.id));
    setDeleteTableConfirm(null);
    toast.success('Table deleted');
  };

  // Waiting list
  const addToWaitingList = () => {
    if (!wlForm.customerName || !wlForm.phone || !wlForm.guests) { toast.error('Fill required fields'); return; }
    const entry: WaitingListEntry = {
      id: `wl-${Date.now()}`, customerName: wlForm.customerName, phone: wlForm.phone,
      guests: parseInt(wlForm.guests), estimatedWait: 20, status: 'waiting',
      notes: wlForm.notes, addedAt: new Date().toISOString(),
    };
    setWaitingList(prev => [...prev, entry]);
    setWlForm({ customerName: '', phone: '', guests: '', notes: '' });
    setWlDialogOpen(false);
    toast.success('Added to waiting list');
  };

  const updateWlStatus = (id: string, status: WaitingStatus) => {
    setWaitingList(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    toast.success(`Status updated to ${status}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservations & Tables</h1>
          <p className="text-sm text-muted-foreground">Manage reservations, tables, and waiting list</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new">New Reservation</TabsTrigger>
          <TabsTrigger value="today">Today's Reservations</TabsTrigger>
          <TabsTrigger value="tables">Table Management</TabsTrigger>
          <TabsTrigger value="waiting">Waiting List</TabsTrigger>
        </TabsList>

        {/* NEW RESERVATION */}
        <TabsContent value="new" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Contact & Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Customer Name *</Label>
                    <Input value={newRes.customerName} onChange={e => setNewRes(p => ({ ...p, customerName: e.target.value }))} placeholder="Full name" />
                    {formErrors.customerName && <p className="text-xs text-destructive">{formErrors.customerName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone *</Label>
                    <Input value={newRes.phone} onChange={e => setNewRes(p => ({ ...p, phone: e.target.value }))} placeholder="555-0000" />
                    {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={newRes.email} onChange={e => setNewRes(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Date *</Label>
                    <Input type="date" value={newRes.date} onChange={e => setNewRes(p => ({ ...p, date: e.target.value }))} />
                    {formErrors.date && <p className="text-xs text-destructive">{formErrors.date}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time *</Label>
                    <Input type="time" value={newRes.time} onChange={e => setNewRes(p => ({ ...p, time: e.target.value }))} />
                    {formErrors.time && <p className="text-xs text-destructive">{formErrors.time}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Guests *</Label>
                    <Input type="number" min={1} value={newRes.guests} onChange={e => setNewRes(p => ({ ...p, guests: e.target.value }))} />
                    {formErrors.guests && <p className="text-xs text-destructive">{formErrors.guests}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea value={newRes.notes} onChange={e => setNewRes(p => ({ ...p, notes: e.target.value }))} placeholder="Special requests..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Select Table</CardTitle></CardHeader>
              <CardContent>
                {formErrors.table && <p className="text-xs text-destructive mb-2">{formErrors.table}</p>}
                {availableTables.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No available tables match criteria. Enter guest count and date first.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto">
                    {availableTables.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTableId(t.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${
                          selectedTableId === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-semibold">Table {t.number}</p>
                        <p className="text-sm text-muted-foreground">Seats {t.capacity}</p>
                        {t.notes && <p className="text-xs text-muted-foreground mt-1">{t.notes}</p>}
                      </button>
                    ))}
                  </div>
                )}
                <Button className="w-full mt-4" onClick={handleConfirmReservation} disabled={!selectedTableId}>
                  Confirm Reservation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TODAY'S RESERVATIONS */}
        <TabsContent value="today">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No reservations</TableCell></TableRow>
                  ) : reservations.map(res => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">{res.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />{res.phone}
                        </div>
                      </TableCell>
                      <TableCell>{res.time}</TableCell>
                      <TableCell>{res.guests}</TableCell>
                      <TableCell>{res.tableNumber ? `T${res.tableNumber}` : '—'}</TableCell>
                      <TableCell><StatusBadge status={res.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{res.notes || '—'}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {res.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => updateResStatus(res.id, 'confirmed')}>Confirm</Button>
                          )}
                          {res.status === 'confirmed' && (
                            <Button size="sm" onClick={() => updateResStatus(res.id, 'checked-in')}>
                              <UserCheck className="h-3.5 w-3.5 mr-1" />Check In
                            </Button>
                          )}
                          {['pending', 'confirmed'].includes(res.status) && (
                            <Button size="sm" variant="ghost" onClick={() => updateResStatus(res.id, 'cancelled')}>Cancel</Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => { setEditingRes(res); setEditResForm({ guests: String(res.guests), notes: res.notes }); setEditResOpen(true); }}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setNotifTarget({ name: res.customerName, phone: res.phone })}>
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TABLE MANAGEMENT */}
        <TabsContent value="tables">
          <div className="flex justify-end mb-4">
            <Button onClick={() => openTableDialog()}><Plus className="h-4 w-4 mr-1" />Add Table</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">Table {t.number}</TableCell>
                      <TableCell>{t.capacity} seats</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.notes || '—'}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openTableDialog(t)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteTableConfirm(t)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WAITING LIST */}
        <TabsContent value="waiting">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setWlDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />Add to Waiting List</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Est. Wait</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingList.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Waiting list is empty</TableCell></TableRow>
                  ) : waitingList.map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.customerName}</TableCell>
                      <TableCell className="text-sm">{w.phone}</TableCell>
                      <TableCell>{w.guests}</TableCell>
                      <TableCell>{w.estimatedWait} min</TableCell>
                      <TableCell><StatusBadge status={w.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{w.notes || '—'}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {w.status === 'waiting' && (
                            <>
                              <Button size="sm" onClick={() => updateWlStatus(w.id, 'seated')}>Seat</Button>
                              <Button size="sm" variant="ghost" onClick={() => updateWlStatus(w.id, 'cancelled')}>Remove</Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setNotifTarget({ name: w.customerName, phone: w.phone })}>
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Table CRUD Dialog */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingTable ? 'Edit Table' : 'Add Table'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Table Number *</Label><Input type="number" value={tableForm.number} onChange={e => setTableForm(p => ({ ...p, number: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Capacity *</Label><Input type="number" value={tableForm.capacity} onChange={e => setTableForm(p => ({ ...p, capacity: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea value={tableForm.notes} onChange={e => setTableForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveTable}>{editingTable ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reservation Dialog */}
      <Dialog open={editResOpen} onOpenChange={setEditResOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Reservation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Guests</Label><Input type="number" value={editResForm.guests} onChange={e => setEditResForm(p => ({ ...p, guests: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea value={editResForm.notes} onChange={e => setEditResForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditResOpen(false)}>Cancel</Button>
            <Button onClick={handleEditRes}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waiting List Add Dialog */}
      <Dialog open={wlDialogOpen} onOpenChange={setWlDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add to Waiting List</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={wlForm.customerName} onChange={e => setWlForm(p => ({ ...p, customerName: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Phone *</Label><Input value={wlForm.phone} onChange={e => setWlForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Guests *</Label><Input type="number" value={wlForm.guests} onChange={e => setWlForm(p => ({ ...p, guests: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea value={wlForm.notes} onChange={e => setWlForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWlDialogOpen(false)}>Cancel</Button>
            <Button onClick={addToWaitingList}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Table Confirm */}
      <ConfirmDialog
        open={!!deleteTableConfirm}
        onOpenChange={() => setDeleteTableConfirm(null)}
        title="Delete Table"
        description={`Are you sure you want to delete Table ${deleteTableConfirm?.number}?`}
        confirmLabel="Delete"
        destructive
        onConfirm={deleteTable}
      />

      {/* Notification Dialog */}
      {notifTarget && (
        <NotificationDialog
          open={!!notifTarget}
          onOpenChange={() => setNotifTarget(null)}
          recipientName={notifTarget.name}
          recipientPhone={notifTarget.phone}
        />
      )}
    </div>
  );
}
