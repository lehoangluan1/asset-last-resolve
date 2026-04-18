import type { PermissionGrant, User } from '@/types';

export const grants = {
  dashboardRead: 'dashboard.read',
  assetsRead: 'assets.read',
  assetsManage: 'assets.manage',
  assignmentsRead: 'assignments.read',
  assignmentsManage: 'assignments.manage',
  borrowsRead: 'borrows.read',
  borrowsRequest: 'borrows.request',
  borrowsApprove: 'borrows.approve',
  verificationRead: 'verification.read',
  verificationManage: 'verification.manage',
  discrepanciesRead: 'discrepancies.read',
  discrepanciesManage: 'discrepancies.manage',
  maintenanceRead: 'maintenance.read',
  maintenanceManage: 'maintenance.manage',
  disposalRead: 'disposal.read',
  disposalManage: 'disposal.manage',
  reportsRead: 'reports.read',
  notificationsRead: 'notifications.read',
  profileRead: 'profile.read',
  profileWrite: 'profile.write',
  usersManage: 'users.manage',
  referenceRead: 'reference.read',
  referenceManage: 'reference.manage',
} as const satisfies Record<string, PermissionGrant>;

export function hasGrant(user: User | null, grant: PermissionGrant) {
  return !!user?.grants.includes(grant);
}

export function hasAnyGrant(user: User | null, required: PermissionGrant[]) {
  return required.some(grant => hasGrant(user, grant));
}
