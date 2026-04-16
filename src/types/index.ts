// ── Enums / Unions ──────────────────────────────────────────
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

// ── Core Entities ───────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId: string;
  location: string;
  employeeCount: number;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId?: string;
}

export interface Location {
  id: string;
  name: string;
  building: string;
  floor: string;
  room?: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryId: string;
  departmentId: string;
  assignedToId: string | null;
  locationId: string;
  condition: AssetCondition;
  lifecycle: LifecycleStatus;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
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
  fromDepartmentId: string | null;
  toUserId: string;
  toDepartmentId: string;
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
  expectedAssignee: string;
  observedLocation: string;
  observedCondition: AssetCondition | '';
  observedAssignee: string;
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
