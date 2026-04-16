import type { AppNotification } from '@/types';

const now = new Date();
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000).toISOString();

export const seedNotifications: AppNotification[] = [
  { id: 'n-1', title: 'Borrow request pending', message: 'David Kim requested to borrow Epson EB-L200F for "Client demo"', type: 'borrow-pending', entityType: 'BorrowRequest', entityId: 'borrow-1', timestamp: h(0.5), read: false, actor: 'David Kim', priority: 'high' },
  { id: 'n-2', title: 'Asset overdue for return', message: 'MacBook Pro 16" (AST-1000) was due back yesterday from Chris Anderson', type: 'asset-overdue', entityType: 'Asset', entityId: 'asset-1', timestamp: h(1), read: false, actor: 'System', priority: 'high' },
  { id: 'n-3', title: 'Verification campaign due soon', message: 'Q2 2025 IT & Operations campaign is due June 30', type: 'verification-due', entityType: 'Campaign', entityId: 'camp-2', timestamp: h(2), read: false },
  { id: 'n-4', title: 'Discrepancy created', message: 'Location mismatch found for Dell Latitude 5540 during Q1 verification', type: 'discrepancy-created', entityType: 'Discrepancy', entityId: 'disc-1', timestamp: h(3), read: false, priority: 'high' },
  { id: 'n-5', title: 'Maintenance completed', message: 'Routine maintenance on HP LaserJet Pro has been completed', type: 'maintenance-completed', entityType: 'Maintenance', entityId: 'maint-3', timestamp: h(5), read: false, actor: 'Alex Johnson' },
  { id: 'n-6', title: 'Borrow request approved', message: 'Your request to borrow BenQ MH733 has been approved by James Wilson', type: 'borrow-approved', entityType: 'BorrowRequest', entityId: 'borrow-5', timestamp: h(8), read: true, actor: 'James Wilson' },
  { id: 'n-7', title: 'Verification task assigned', message: 'You have been assigned 12 verification tasks for Q2 campaign', type: 'verification-assigned', entityType: 'Campaign', entityId: 'camp-2', timestamp: h(12), read: true },
  { id: 'n-8', title: 'Disposal request awaiting review', message: 'Dell OptiPlex 7090 #3 has been proposed for disposal', type: 'disposal-review', entityType: 'Disposal', entityId: 'disp-1', timestamp: h(18), read: true },
  { id: 'n-9', title: 'Asset transferred', message: 'Herman Miller Aeron transferred from IT to Marketing', type: 'asset-transferred', entityType: 'Asset', entityId: 'asset-14', timestamp: h(24), read: true, actor: 'James Wilson' },
  { id: 'n-10', title: 'New user registered', message: 'Kevin Harris has been added to the Marketing department', type: 'user-created', entityType: 'User', entityId: 'user-15', timestamp: h(36), read: true, actor: 'Sarah Chen' },
  { id: 'n-11', title: 'Borrow request rejected', message: 'Your request to borrow Cisco Catalyst 9300 was rejected — asset under maintenance', type: 'borrow-rejected', entityType: 'BorrowRequest', entityId: 'borrow-8', timestamp: h(48), read: true, actor: 'James Wilson' },
  { id: 'n-12', title: 'Verification campaign completed', message: 'Q1 2025 Full Verification has been completed with 7 discrepancies', type: 'verification-due', entityType: 'Campaign', entityId: 'camp-1', timestamp: h(72), read: true },
  { id: 'n-13', title: 'Maintenance scheduled', message: 'Preventive maintenance scheduled for Dell PowerEdge R750 on May 15', type: 'general', entityType: 'Maintenance', entityId: 'maint-10', timestamp: h(96), read: true },
  { id: 'n-14', title: 'Borrow request pending', message: 'Rachel Green requested to borrow iPhone 15 Pro for "Off-site event"', type: 'borrow-pending', entityType: 'BorrowRequest', entityId: 'borrow-12', timestamp: h(120), read: true, actor: 'Rachel Green' },
  { id: 'n-15', title: 'Discrepancy resolved', message: 'Condition mismatch for LG 34WN80C-B has been resolved', type: 'discrepancy-created', entityType: 'Discrepancy', entityId: 'disc-5', timestamp: h(144), read: true, actor: 'Sarah Chen' },
];
