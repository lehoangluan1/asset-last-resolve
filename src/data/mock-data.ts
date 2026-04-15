import type {
  RestaurantTable, Reservation, WaitingListEntry, MenuCategory, MenuItem,
  Ingredient, Order, OrderItem, Bill, BillItem, Promotion
} from '@/types';

export const tables: RestaurantTable[] = [
  { id: 't1', number: 1, capacity: 2, status: 'occupied', notes: 'Window seat', currentOrderId: 'ord-1', currentReservationId: null, checkinTime: '2025-04-15T18:30:00', reservationTime: null },
  { id: 't2', number: 2, capacity: 4, status: 'reserved', notes: '', currentOrderId: null, currentReservationId: 'res-1', checkinTime: null, reservationTime: '2025-04-15T19:00:00' },
  { id: 't3', number: 3, capacity: 4, status: 'available', notes: '', currentOrderId: null, currentReservationId: null, checkinTime: null, reservationTime: null },
  { id: 't4', number: 4, capacity: 6, status: 'occupied', notes: 'Near bar', currentOrderId: 'ord-2', currentReservationId: null, checkinTime: '2025-04-15T18:45:00', reservationTime: null },
  { id: 't5', number: 5, capacity: 2, status: 'cleaning', notes: '', currentOrderId: null, currentReservationId: null, checkinTime: null, reservationTime: null },
  { id: 't6', number: 6, capacity: 8, status: 'reserved', notes: 'VIP section', currentOrderId: null, currentReservationId: 'res-2', checkinTime: null, reservationTime: '2025-04-15T20:00:00' },
  { id: 't7', number: 7, capacity: 4, status: 'occupied', notes: '', currentOrderId: 'ord-3', currentReservationId: null, checkinTime: '2025-04-15T19:15:00', reservationTime: null },
  { id: 't8', number: 8, capacity: 2, status: 'available', notes: 'Patio', currentOrderId: null, currentReservationId: null, checkinTime: null, reservationTime: null },
  { id: 't9', number: 9, capacity: 6, status: 'occupied', notes: '', currentOrderId: 'ord-4', currentReservationId: null, checkinTime: '2025-04-15T17:45:00', reservationTime: null },
  { id: 't10', number: 10, capacity: 4, status: 'available', notes: '', currentOrderId: null, currentReservationId: null, checkinTime: null, reservationTime: null },
  { id: 't11', number: 11, capacity: 8, status: 'inactive', notes: 'Under maintenance', currentOrderId: null, currentReservationId: null, checkinTime: null, reservationTime: null },
  { id: 't12', number: 12, capacity: 2, status: 'occupied', notes: '', currentOrderId: 'ord-5', currentReservationId: null, checkinTime: '2025-04-15T19:30:00', reservationTime: null },
  { id: 't13', number: 13, capacity: 4, status: 'reserved', notes: '', currentOrderId: null, currentReservationId: 'res-3', checkinTime: null, reservationTime: '2025-04-15T19:30:00' },
  { id: 't14', number: 14, capacity: 6, status: 'available', notes: 'Corner booth', currentOrderId: null, currentReservationId: null, checkinTime: null, reservationTime: null },
  { id: 't15', number: 15, capacity: 2, status: 'cleaning', notes: '', currentOrderId: null, currentReservationId: null, checkinTime: null, reservationTime: null },
];

export const reservations: Reservation[] = [
  { id: 'res-1', customerName: 'John Smith', phone: '555-0101', email: 'john@email.com', date: '2025-04-15', time: '19:00', guests: 3, tableId: 't2', tableNumber: 2, status: 'confirmed', notes: 'Birthday dinner', createdAt: '2025-04-14T10:00:00Z' },
  { id: 'res-2', customerName: 'Maria Garcia', phone: '555-0102', email: 'maria@email.com', date: '2025-04-15', time: '20:00', guests: 6, tableId: 't6', tableNumber: 6, status: 'confirmed', notes: 'Business dinner', createdAt: '2025-04-13T14:00:00Z' },
  { id: 'res-3', customerName: 'David Lee', phone: '555-0103', email: 'david@email.com', date: '2025-04-15', time: '19:30', guests: 4, tableId: 't13', tableNumber: 13, status: 'pending', notes: '', createdAt: '2025-04-15T08:00:00Z' },
  { id: 'res-4', customerName: 'Sarah Johnson', phone: '555-0104', email: 'sarah@email.com', date: '2025-04-15', time: '18:00', guests: 2, tableId: 't1', tableNumber: 1, status: 'checked-in', notes: '', createdAt: '2025-04-14T16:00:00Z' },
  { id: 'res-5', customerName: 'Alex Brown', phone: '555-0105', email: 'alex@email.com', date: '2025-04-15', time: '21:00', guests: 4, tableId: null, tableNumber: null, status: 'pending', notes: 'Allergic to nuts', createdAt: '2025-04-15T09:00:00Z' },
  { id: 'res-6', customerName: 'Emma Wilson', phone: '555-0106', email: 'emma@email.com', date: '2025-04-15', time: '18:30', guests: 2, tableId: null, tableNumber: null, status: 'cancelled', notes: '', createdAt: '2025-04-13T11:00:00Z' },
  { id: 'res-7', customerName: 'James Taylor', phone: '555-0107', email: 'james@email.com', date: '2025-04-15', time: '19:00', guests: 5, tableId: null, tableNumber: null, status: 'no-show', notes: '', createdAt: '2025-04-14T12:00:00Z' },
  { id: 'res-8', customerName: 'Lisa Chen', phone: '555-0108', email: 'lisa@email.com', date: '2025-04-15', time: '20:30', guests: 3, tableId: null, tableNumber: null, status: 'pending', notes: 'Anniversary', createdAt: '2025-04-15T10:00:00Z' },
];

export const waitingList: WaitingListEntry[] = [
  { id: 'wl-1', customerName: 'Tom Harris', phone: '555-0201', guests: 2, estimatedWait: 15, status: 'waiting', notes: '', addedAt: '2025-04-15T19:00:00Z' },
  { id: 'wl-2', customerName: 'Nina Patel', phone: '555-0202', guests: 4, estimatedWait: 25, status: 'waiting', notes: 'Prefer indoor', addedAt: '2025-04-15T19:05:00Z' },
  { id: 'wl-3', customerName: 'Carlos Rivera', phone: '555-0203', guests: 6, estimatedWait: 35, status: 'waiting', notes: '', addedAt: '2025-04-15T19:10:00Z' },
  { id: 'wl-4', customerName: 'Amy Zhang', phone: '555-0204', guests: 2, estimatedWait: 10, status: 'seated', notes: '', addedAt: '2025-04-15T18:45:00Z' },
  { id: 'wl-5', customerName: 'Robert Kim', phone: '555-0205', guests: 3, estimatedWait: 20, status: 'cancelled', notes: 'Left', addedAt: '2025-04-15T18:50:00Z' },
];

export const menuCategories: MenuCategory[] = [
  { id: 'cat-1', name: 'Appetizers', description: 'Starters and small plates', sortOrder: 1, itemCount: 5 },
  { id: 'cat-2', name: 'Mains', description: 'Main course dishes', sortOrder: 2, itemCount: 6 },
  { id: 'cat-3', name: 'Grilled', description: 'From the grill', sortOrder: 3, itemCount: 4 },
  { id: 'cat-4', name: 'Salads', description: 'Fresh salads', sortOrder: 4, itemCount: 3 },
  { id: 'cat-5', name: 'Desserts', description: 'Sweet treats', sortOrder: 5, itemCount: 4 },
  { id: 'cat-6', name: 'Drinks', description: 'Beverages', sortOrder: 6, itemCount: 5 },
];

export const menuItems: MenuItem[] = [
  { id: 'mi-1', name: 'Bruschetta', price: 9.50, description: 'Toasted bread with tomato and basil', categoryId: 'cat-1', station: 'prep', ingredientIds: ['ing-1', 'ing-2', 'ing-3'], status: 'active' },
  { id: 'mi-2', name: 'Calamari', price: 12.00, description: 'Crispy fried squid with aioli', categoryId: 'cat-1', station: 'fryer', ingredientIds: ['ing-4', 'ing-5'], status: 'active' },
  { id: 'mi-3', name: 'Soup of the Day', price: 8.00, description: 'Chef\'s daily soup selection', categoryId: 'cat-1', station: 'prep', ingredientIds: ['ing-6'], status: 'active' },
  { id: 'mi-4', name: 'Spring Rolls', price: 10.00, description: 'Vegetable spring rolls', categoryId: 'cat-1', station: 'fryer', ingredientIds: ['ing-7', 'ing-8'], status: 'active' },
  { id: 'mi-5', name: 'Garlic Bread', price: 6.50, description: 'With herb butter', categoryId: 'cat-1', station: 'prep', ingredientIds: ['ing-1', 'ing-9'], status: 'active' },
  { id: 'mi-6', name: 'Grilled Salmon', price: 24.00, description: 'Atlantic salmon with lemon butter', categoryId: 'cat-2', station: 'grill', ingredientIds: ['ing-10', 'ing-11'], status: 'active' },
  { id: 'mi-7', name: 'Chicken Parmesan', price: 19.50, description: 'Breaded chicken with marinara', categoryId: 'cat-2', station: 'fryer', ingredientIds: ['ing-12', 'ing-13'], status: 'active' },
  { id: 'mi-8', name: 'Pasta Carbonara', price: 17.00, description: 'Classic cream and bacon pasta', categoryId: 'cat-2', station: 'prep', ingredientIds: ['ing-14', 'ing-15'], status: 'active' },
  { id: 'mi-9', name: 'Fish & Chips', price: 16.50, description: 'Beer-battered cod with fries', categoryId: 'cat-2', station: 'fryer', ingredientIds: ['ing-16', 'ing-17'], status: 'active' },
  { id: 'mi-10', name: 'Beef Burger', price: 15.00, description: 'Angus beef with toppings', categoryId: 'cat-2', station: 'grill', ingredientIds: ['ing-18', 'ing-1'], status: 'active' },
  { id: 'mi-11', name: 'Vegetable Stir Fry', price: 14.00, description: 'Seasonal vegetables in soy sauce', categoryId: 'cat-2', station: 'prep', ingredientIds: ['ing-7', 'ing-8'], status: 'inactive' },
  { id: 'mi-12', name: 'Ribeye Steak', price: 32.00, description: '12oz ribeye, choice of sides', categoryId: 'cat-3', station: 'grill', ingredientIds: ['ing-18', 'ing-19'], status: 'active' },
  { id: 'mi-13', name: 'BBQ Ribs', price: 26.00, description: 'Slow-cooked pork ribs', categoryId: 'cat-3', station: 'grill', ingredientIds: ['ing-20', 'ing-19'], status: 'active' },
  { id: 'mi-14', name: 'Grilled Chicken', price: 18.00, description: 'Herb-marinated chicken breast', categoryId: 'cat-3', station: 'grill', ingredientIds: ['ing-12', 'ing-9'], status: 'active' },
  { id: 'mi-15', name: 'Lamb Chops', price: 29.00, description: 'New Zealand lamb with mint', categoryId: 'cat-3', station: 'grill', ingredientIds: ['ing-19'], status: 'active' },
  { id: 'mi-16', name: 'Caesar Salad', price: 13.00, description: 'Romaine with caesar dressing', categoryId: 'cat-4', station: 'salad', ingredientIds: ['ing-7', 'ing-13'], status: 'active' },
  { id: 'mi-17', name: 'Greek Salad', price: 12.00, description: 'Feta, olives, cucumber, tomato', categoryId: 'cat-4', station: 'salad', ingredientIds: ['ing-2', 'ing-13'], status: 'active' },
  { id: 'mi-18', name: 'Garden Salad', price: 10.00, description: 'Mixed greens with vinaigrette', categoryId: 'cat-4', station: 'salad', ingredientIds: ['ing-7'], status: 'active' },
  { id: 'mi-19', name: 'Tiramisu', price: 11.00, description: 'Classic Italian dessert', categoryId: 'cat-5', station: 'dessert', ingredientIds: [], status: 'active' },
  { id: 'mi-20', name: 'Cheesecake', price: 10.00, description: 'New York style with berry sauce', categoryId: 'cat-5', station: 'dessert', ingredientIds: [], status: 'active' },
  { id: 'mi-21', name: 'Chocolate Lava Cake', price: 12.00, description: 'Warm molten chocolate center', categoryId: 'cat-5', station: 'dessert', ingredientIds: [], status: 'active' },
  { id: 'mi-22', name: 'Ice Cream Sundae', price: 8.00, description: 'Three scoops with toppings', categoryId: 'cat-5', station: 'dessert', ingredientIds: [], status: 'active' },
  { id: 'mi-23', name: 'Craft Beer', price: 7.00, description: 'Local IPA on tap', categoryId: 'cat-6', station: 'drink', ingredientIds: [], status: 'active' },
  { id: 'mi-24', name: 'House Wine', price: 9.00, description: 'Red or white, per glass', categoryId: 'cat-6', station: 'drink', ingredientIds: [], status: 'active' },
  { id: 'mi-25', name: 'Fresh Lemonade', price: 5.00, description: 'Freshly squeezed', categoryId: 'cat-6', station: 'drink', ingredientIds: ['ing-11'], status: 'active' },
  { id: 'mi-26', name: 'Espresso', price: 4.00, description: 'Double shot', categoryId: 'cat-6', station: 'drink', ingredientIds: [], status: 'active' },
  { id: 'mi-27', name: 'Sparkling Water', price: 3.50, description: 'San Pellegrino', categoryId: 'cat-6', station: 'drink', ingredientIds: [], status: 'active' },
];

export const ingredients: Ingredient[] = [
  { id: 'ing-1', name: 'Bread', unit: 'loaf', currentStock: 20, lowStockThreshold: 5, costPerUnit: 2.50 },
  { id: 'ing-2', name: 'Tomatoes', unit: 'kg', currentStock: 15, lowStockThreshold: 5, costPerUnit: 3.00 },
  { id: 'ing-3', name: 'Basil', unit: 'bunch', currentStock: 8, lowStockThreshold: 3, costPerUnit: 1.50 },
  { id: 'ing-4', name: 'Squid', unit: 'kg', currentStock: 5, lowStockThreshold: 2, costPerUnit: 12.00 },
  { id: 'ing-5', name: 'Flour', unit: 'kg', currentStock: 25, lowStockThreshold: 5, costPerUnit: 1.20 },
  { id: 'ing-6', name: 'Mixed Vegetables', unit: 'kg', currentStock: 10, lowStockThreshold: 3, costPerUnit: 4.00 },
  { id: 'ing-7', name: 'Lettuce', unit: 'head', currentStock: 12, lowStockThreshold: 4, costPerUnit: 2.00 },
  { id: 'ing-8', name: 'Carrots', unit: 'kg', currentStock: 8, lowStockThreshold: 3, costPerUnit: 2.50 },
  { id: 'ing-9', name: 'Butter', unit: 'kg', currentStock: 6, lowStockThreshold: 2, costPerUnit: 8.00 },
  { id: 'ing-10', name: 'Salmon Fillet', unit: 'kg', currentStock: 4, lowStockThreshold: 2, costPerUnit: 22.00 },
  { id: 'ing-11', name: 'Lemons', unit: 'kg', currentStock: 7, lowStockThreshold: 3, costPerUnit: 3.50 },
  { id: 'ing-12', name: 'Chicken Breast', unit: 'kg', currentStock: 10, lowStockThreshold: 3, costPerUnit: 9.00 },
  { id: 'ing-13', name: 'Parmesan Cheese', unit: 'kg', currentStock: 3, lowStockThreshold: 1, costPerUnit: 18.00 },
  { id: 'ing-14', name: 'Pasta', unit: 'kg', currentStock: 20, lowStockThreshold: 5, costPerUnit: 2.00 },
  { id: 'ing-15', name: 'Bacon', unit: 'kg', currentStock: 6, lowStockThreshold: 2, costPerUnit: 11.00 },
  { id: 'ing-16', name: 'Cod Fillet', unit: 'kg', currentStock: 5, lowStockThreshold: 2, costPerUnit: 15.00 },
  { id: 'ing-17', name: 'Potatoes', unit: 'kg', currentStock: 30, lowStockThreshold: 8, costPerUnit: 1.50 },
  { id: 'ing-18', name: 'Beef', unit: 'kg', currentStock: 8, lowStockThreshold: 3, costPerUnit: 20.00 },
  { id: 'ing-19', name: 'Olive Oil', unit: 'liter', currentStock: 5, lowStockThreshold: 2, costPerUnit: 7.00 },
  { id: 'ing-20', name: 'Pork Ribs', unit: 'kg', currentStock: 6, lowStockThreshold: 2, costPerUnit: 14.00 },
];

const mkOrderItem = (id: string, mi: MenuItem, qty: number, status: OrderItem['status'], notes = '', priority: OrderItem['priority'] = 'normal'): OrderItem => ({
  id, menuItemId: mi.id, menuItemName: mi.name, quantity: qty, price: mi.price, status, station: mi.station, notes, priority,
});

export const orders: Order[] = [
  {
    id: 'ord-1', tableId: 't1', tableNumber: 1, status: 'cooking', priority: 'normal', createdAt: '2025-04-15T18:35:00Z', updatedAt: '2025-04-15T18:40:00Z', notes: '',
    items: [
      mkOrderItem('oi-1', menuItems[0], 1, 'ready'),
      mkOrderItem('oi-2', menuItems[5], 1, 'cooking', 'Medium rare'),
      mkOrderItem('oi-3', menuItems[23], 2, 'ready'),
    ],
  },
  {
    id: 'ord-2', tableId: 't4', tableNumber: 4, status: 'cooking', priority: 'high', createdAt: '2025-04-15T18:50:00Z', updatedAt: '2025-04-15T18:55:00Z', notes: 'VIP guests',
    items: [
      mkOrderItem('oi-4', menuItems[11], 2, 'cooking', 'Well done'),
      mkOrderItem('oi-5', menuItems[15], 2, 'ready'),
      mkOrderItem('oi-6', menuItems[18], 2, 'pending'),
      mkOrderItem('oi-7', menuItems[23], 4, 'ready'),
    ],
  },
  {
    id: 'ord-3', tableId: 't7', tableNumber: 7, status: 'confirmed', priority: 'normal', createdAt: '2025-04-15T19:20:00Z', updatedAt: '2025-04-15T19:20:00Z', notes: '',
    items: [
      mkOrderItem('oi-8', menuItems[1], 1, 'pending'),
      mkOrderItem('oi-9', menuItems[7], 2, 'pending'),
      mkOrderItem('oi-10', menuItems[24], 2, 'pending'),
    ],
  },
  {
    id: 'ord-4', tableId: 't9', tableNumber: 9, status: 'ready', priority: 'normal', createdAt: '2025-04-15T17:50:00Z', updatedAt: '2025-04-15T18:30:00Z', notes: '',
    items: [
      mkOrderItem('oi-11', menuItems[9], 3, 'ready'),
      mkOrderItem('oi-12', menuItems[16], 1, 'ready'),
      mkOrderItem('oi-13', menuItems[22], 3, 'ready'),
    ],
  },
  {
    id: 'ord-5', tableId: 't12', tableNumber: 12, status: 'cooking', priority: 'normal', createdAt: '2025-04-15T19:35:00Z', updatedAt: '2025-04-15T19:40:00Z', notes: '',
    items: [
      mkOrderItem('oi-14', menuItems[2], 2, 'ready'),
      mkOrderItem('oi-15', menuItems[6], 1, 'cooking', 'No spice'),
      mkOrderItem('oi-16', menuItems[19], 2, 'pending'),
    ],
  },
];

const mkBillItem = (oi: OrderItem): BillItem => ({
  id: `bi-${oi.id}`, name: oi.menuItemName, quantity: oi.quantity, price: oi.price, total: oi.quantity * oi.price,
});

export const bills: Bill[] = [
  (() => {
    const order = orders[3];
    const items = order.items.map(mkBillItem);
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    return { id: 'bill-1', orderId: order.id, tableId: order.tableId, tableNumber: order.tableNumber, items, subtotal, tax, discount: 0, total: Math.round((subtotal + tax) * 100) / 100, status: 'open' as const, createdAt: '2025-04-15T18:35:00Z' };
  })(),
];

export const promotions: Promotion[] = [
  { id: 'promo-1', code: 'WELCOME10', description: '10% off first visit', discountType: 'percentage', discountValue: 10, minOrderAmount: 30, status: 'active', validFrom: '2025-01-01', validTo: '2025-12-31', usageCount: 42, maxUsage: 200 },
  { id: 'promo-2', code: 'LUNCH5', description: '$5 off lunch orders', discountType: 'fixed', discountValue: 5, minOrderAmount: 20, status: 'active', validFrom: '2025-03-01', validTo: '2025-06-30', usageCount: 18, maxUsage: 100 },
  { id: 'promo-3', code: 'SUMMER20', description: '20% summer special', discountType: 'percentage', discountValue: 20, minOrderAmount: 50, status: 'inactive', validFrom: '2025-06-01', validTo: '2025-08-31', usageCount: 0, maxUsage: 150 },
  { id: 'promo-4', code: 'VIP15', description: '15% VIP discount', discountType: 'percentage', discountValue: 15, minOrderAmount: 0, status: 'expired', validFrom: '2024-01-01', validTo: '2024-12-31', usageCount: 89, maxUsage: 100 },
];

// Helpers
export const getTableById = (id: string) => tables.find(t => t.id === id);
export const getMenuItemById = (id: string) => menuItems.find(m => m.id === id);
export const getCategoryById = (id: string) => menuCategories.find(c => c.id === id);
export const getIngredientById = (id: string) => ingredients.find(i => i.id === id);
export const getOrderById = (id: string) => orders.find(o => o.id === id);
