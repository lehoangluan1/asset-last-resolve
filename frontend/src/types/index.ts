export type UserRole = 'admin' | 'officer' | 'manager' | 'employee' | 'technician' | 'auditor';
export type UserStatus = 'active' | 'inactive' | 'locked';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'non-functional';
export type LifecycleStatus = 'in-use' | 'in-storage' | 'under-maintenance' | 'pending-disposal' | 'disposed' | 'borrowed';
export type AssignmentType = 'permanent' | 'temporary' | 'borrow';
export type TransferStatus = 'pending' | 'completed' | 'cancelled';

export type BorrowStatus = 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'checked-out' | 'returned' | 'overdue' | 'cancelled';
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type VerificationResult = 'matched' | 'discrepancy' | 'pending';
export type DiscrepancySeverity = 'low' | 'medium' | 'high' | 'critical';
export type DiscrepancyStatus = 'open' | 'investigating' | 'resolved' | 'escalated';
export type DiscrepancyType = 'location' | 'condition' | 'assignee' | 'missing' | 'other';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type TechCondition = 'good' | 'needs-monitoring' | 'under-repair' | 'not-ready';
export type DisposalStatus = 'proposed' | 'under-review' | 'approved' | 'rejected' | 'deferred' | 'completed';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type PermissionGrant =
  | 'dashboard.read'
  | 'assets.read'
  | 'assets.manage'
  | 'assignments.read'
  | 'assignments.manage'
  | 'borrows.read'
  | 'borrows.request'
  | 'borrows.approve'
  | 'verification.read'
  | 'verification.manage'
  | 'discrepancies.read'
  | 'discrepancies.manage'
  | 'maintenance.read'
  | 'maintenance.manage'
  | 'disposal.read'
  | 'disposal.manage'
  | 'reports.read'
  | 'notifications.read'
  | 'profile.read'
  | 'profile.write'
  | 'users.manage'
  | 'reference.read'
  | 'reference.manage';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  status: UserStatus;
  avatar?: string | null;
  phone?: string | null;
  bio?: string | null;
  grants: PermissionGrant[];
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string | null;
  managerName?: string | null;
  location: string;
  employeeCount: number;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId?: string | null;
  borrowableByDefault?: boolean;
  requiresSerial?: boolean;
  requiresVerification?: boolean;
  status?: 'active' | 'inactive';
}

export interface Location {
  id: string;
  name: string;
  building: string;
  floor: string;
  room?: string | null;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  departmentId: string;
  departmentName?: string;
  assignedToId: string | null;
  assignedToName?: string | null;
  locationId: string;
  locationName?: string;
  condition: AssetCondition;
  lifecycle: LifecycleStatus;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyExpiry: string | null;
  borrowable: boolean;
  lastVerifiedDate: string | null;
  nextVerificationDue: string | null;
  notes: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  type: AssignmentType;
  fromUserId: string | null;
  fromUserName?: string | null;
  fromDepartmentId: string | null;
  fromDepartmentCode?: string | null;
  toUserId: string;
  toUserName?: string;
  toDepartmentId: string;
  toDepartmentCode?: string;
  status: TransferStatus;
  effectiveDate: string;
  returnDate: string | null;
  notes: string;
  createdAt: string;
  createdBy: string;
}

export interface BorrowRequest {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  requesterId: string;
  requesterName: string;
  departmentId: string;
  departmentName?: string;
  borrowDate: string;
  returnDate: string;
  purpose: string;
  notes: string;
  status: BorrowStatus;
  approvedBy: string | null;
  approverNotes: string;
  checkedOutAt: string | null;
  returnedAt: string | null;
  createdAt: string;
}

export interface VerificationCampaign {
  id: string;
  code: string;
  name: string;
  year: number;
  scope: string;
  departmentIds: string[];
  status: CampaignStatus;
  dueDate: string;
  startDate: string;
  totalTasks: number;
  completedTasks: number;
  discrepancyCount: number;
  createdAt: string;
  tasks?: VerificationTask[];
}

export interface VerificationTask {
  id: string;
  campaignId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  assignedToId: string;
  expectedLocation: string;
  expectedCondition: AssetCondition;
  expectedAssignee: string | null;
  observedLocation: string | null;
  observedCondition: AssetCondition | null;
  observedAssignee: string | null;
  result: VerificationResult;
  notes: string;
  verifiedAt: string | null;
}

export interface Discrepancy {
  id: string;
  campaignId: string;
  taskId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  type: DiscrepancyType;
  severity: DiscrepancySeverity;
  status: DiscrepancyStatus;
  expectedValue: string;
  observedValue: string;
  rootCause: string;
  resolution: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  type: string;
  description: string;
  techCondition: TechCondition;
  status: MaintenanceStatus;
  priority: Priority;
  assignedToId?: string;
  assignedTo: string;
  scheduledDate: string;
  completedDate: string | null;
  cost: number;
  notes: string;
  createdAt: string;
}

export interface DisposalRequest {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  reason: string;
  status: DisposalStatus;
  proposedBy: string;
  reviewedBy: string | null;
  effectiveDate: string | null;
  estimatedValue: number;
  notes: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  details: string;
  correlationId: string;
}

export interface DemoAccount {
  username: string;
  password: string;
  role: UserRole;
  label: string;
}

export type NotificationType =
  | 'borrow-pending' | 'borrow-approved' | 'borrow-rejected'
  | 'asset-overdue' | 'verification-due' | 'verification-assigned'
  | 'discrepancy-created' | 'maintenance-completed'
  | 'disposal-review' | 'user-created' | 'asset-transferred' | 'general';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  entityType?: string;
  entityId?: string;
  timestamp: string;
  read: boolean;
  actor?: string;
  priority?: 'normal' | 'high';
}

export interface DashboardStat {
  key: string;
  label: string;
  value: number;
  variant: string;
  subtitle?: string | null;
}

export interface DashboardDistributionItem {
  name: string;
  value: number;
}

export interface ActiveCampaignSummary {
  id: string;
  name: string;
  scope: string;
  dueDate: string;
  totalTasks: number;
  completedTasks: number;
  discrepancyCount: number;
}

export interface DeadlineItem {
  label: string;
  date: string;
  status: string;
}

export interface DashboardData {
  role: UserRole;
  stats: DashboardStat[];
  departmentDistribution: DashboardDistributionItem[];
  statusBreakdown: DashboardDistributionItem[];
  activeCampaign: ActiveCampaignSummary | null;
  recentActivity: AuditLog[];
  upcomingDeadlines: DeadlineItem[];
}

export interface ReportSummary {
  totalAssets: number;
  openDiscrepancies: number;
  activeMaintenance: number;
  activeBorrows: number;
}

export interface PageResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: string | null;
  href: string;
}

export interface SearchSection {
  key: string;
  label: string;
  href: string;
  totalItems: number;
  items: SearchItem[];
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  sections: SearchSection[];
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: { field: string; message: string }[];
}

export interface AssetDetail {
  asset: Asset;
  assignments: Assignment[];
  borrowRequests: BorrowRequest[];
  maintenanceRecords: MaintenanceRecord[];
  verificationTasks: VerificationTask[];
  discrepancies: Discrepancy[];
  auditLogs: AuditLog[];
}
