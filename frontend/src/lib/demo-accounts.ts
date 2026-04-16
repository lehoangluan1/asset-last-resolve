import type { DemoAccount } from '@/types';

export const demoAccounts: DemoAccount[] = [
  { username: 'admin', password: 'demo123', role: 'admin', label: 'Administrator' },
  { username: 'officer', password: 'demo123', role: 'officer', label: 'Asset Officer' },
  { username: 'manager', password: 'demo123', role: 'manager', label: 'Department Manager' },
  { username: 'employee', password: 'demo123', role: 'employee', label: 'Employee' },
  { username: 'technician', password: 'demo123', role: 'technician', label: 'Technician' },
  { username: 'auditor', password: 'demo123', role: 'auditor', label: 'Auditor' },
];
