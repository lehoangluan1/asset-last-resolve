export type AssetCondition = 'new' | 'good' | 'fair' | 'needs-repair' | 'not-operational';
export type AssetLifecycle = 'in-use' | 'in-storage' | 'under-maintenance' | 'pending-disposal' | 'disposed';
export type VerificationStatus = 'matched' | 'discrepancy' | 'pending' | 'not-started';
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type DiscrepancySeverity = 'low' | 'medium' | 'high' | 'critical';
export type DiscrepancyStatus = 'open' | 'investigating' | 'resolved' | 'escalated';
export type MaintenanceStatus = 'good' | 'needs-monitoring' | 'under-repair' | 'not-ready';
export type DisposalStatus = 'proposed' | 'under-review' | 'approved' | 'rejected' | 'completed' | 'deferred';
export type UserRole = 'asset-officer' | 'department-manager' | 'employee' | 'verification-coordinator' | 'technician' | 'auditor';

export interface Department {
  id: string;
  name: string;
  code: string;
  headCount: number;
  manager: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  avatar?: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  departmentId: string;
  assignedTo: string | null;
  location: string;
  condition: AssetCondition;
  lifecycle: AssetLifecycle;
  acquisitionDate: string;
  acquisitionCost: number;
  lastVerifiedDate: string | null;
  notes: string;
}

export interface Assignment {
  id: string;
  assetId: string;
  fromUserId: string | null;
  toUserId: string;
  fromDepartmentId: string | null;
  toDepartmentId: string;
  type: 'assign' | 'transfer' | 'recall';
  effectiveDate: string;
  notes: string;
  createdAt: string;
}

export interface VerificationCampaign {
  id: string;
  code: string;
  year: number;
  name: string;
  scope: string;
  status: CampaignStatus;
  startDate: string;
  dueDate: string;
  departmentIds: string[];
  totalTasks: number;
  completedTasks: number;
  discrepancyCount: number;
}

export interface VerificationTask {
  id: string;
  campaignId: string;
  assetId: string;
  assignedTo: string;
  status: VerificationStatus;
  expectedLocation: string;
  expectedCondition: AssetCondition;
  expectedAssignee: string | null;
  observedLocation: string | null;
  observedCondition: AssetCondition | null;
  observedAssignee: string | null;
  notes: string;
  verifiedAt: string | null;
}

export interface Discrepancy {
  id: string;
  campaignId: string;
  taskId: string;
  assetId: string;
  type: string;
  severity: DiscrepancySeverity;
  status: DiscrepancyStatus;
  expectedValue: string;
  observedValue: string;
  rootCause: string | null;
  resolution: string | null;
  reportedAt: string;
  resolvedAt: string | null;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: string;
  description: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate: string | null;
  cost: number;
  technician: string;
  notes: string;
}

export interface DisposalRequest {
  id: string;
  assetId: string;
  reason: string;
  status: DisposalStatus;
  requestedBy: string;
  requestedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  effectiveDate: string | null;
  notes: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityName: string;
  entityId: string;
  timestamp: string;
  before: string | null;
  after: string | null;
  correlationId: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  count: number;
}
