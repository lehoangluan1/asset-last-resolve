export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning' | 'inactive';
export type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
export type WaitingStatus = 'waiting' | 'seated' | 'cancelled' | 'expired';
export type OrderStatus = 'pending' | 'confirmed' | 'cooking' | 'ready' | 'served' | 'cancelled' | 'delayed';
export type OrderItemStatus = 'pending' | 'started' | 'cooking' | 'ready' | 'served' | 'cancelled' | 'delayed';
export type KitchenStation = 'grill' | 'fryer' | 'dessert' | 'drink' | 'salad' | 'prep';
export type BillStatus = 'open' | 'paid' | 'split' | 'refunded' | 'cancelled';
export type MenuItemStatus = 'active' | 'inactive';
export type PromotionStatus = 'active' | 'inactive' | 'expired';
export type Priority = 'normal' | 'high' | 'urgent';
export type SplitMethod = 'equal' | 'by-item' | 'by-seat' | 'by-amount';

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  notes: string;
  currentOrderId: string | null;
  currentReservationId: string | null;
  checkinTime: string | null;
  reservationTime: string | null;
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  tableId: string | null;
  tableNumber: number | null;
  status: ReservationStatus;
  notes: string;
  createdAt: string;
}

export interface WaitingListEntry {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  estimatedWait: number;
  status: WaitingStatus;
  notes: string;
  addedAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  itemCount: number;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  costPerUnit: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  station: KitchenStation;
  ingredientIds: string[];
  status: MenuItemStatus;
  image?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  status: OrderItemStatus;
  station: KitchenStation;
  notes: string;
  priority: Priority;
  cancelReason?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  notes: string;
  cancelReason?: string;
}

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface BillSplit {
  id: string;
  label: string;
  amount: number;
  itemIds?: string[];
  paid: boolean;
}

export interface Bill {
  id: string;
  orderId: string;
  tableId: string;
  tableNumber: number;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: BillStatus;
  splitMethod?: SplitMethod;
  splits?: BillSplit[];
  promoCode?: string;
  refundReason?: string;
  createdAt: string;
  paidAt?: string;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  status: PromotionStatus;
  validFrom: string;
  validTo: string;
  usageCount: number;
  maxUsage: number;
}

export interface NotificationPayload {
  recipientName: string;
  recipientPhone: string;
  message: string;
}
