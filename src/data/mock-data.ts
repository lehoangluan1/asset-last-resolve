import type { Department, User, Asset, Assignment, VerificationCampaign, VerificationTask, Discrepancy, MaintenanceRecord, DisposalRequest, AuditLog, AssetCategory } from '@/types';

export const departments: Department[] = [
  { id: 'dept-1', name: 'Information Technology', code: 'IT', headCount: 45, manager: 'Sarah Chen' },
  { id: 'dept-2', name: 'Human Resources', code: 'HR', headCount: 18, manager: 'Michael Torres' },
  { id: 'dept-3', name: 'Finance & Accounting', code: 'FIN', headCount: 22, manager: 'Emily Watson' },
  { id: 'dept-4', name: 'Operations', code: 'OPS', headCount: 56, manager: 'David Park' },
  { id: 'dept-5', name: 'Marketing', code: 'MKT', headCount: 15, manager: 'Lisa Nguyen' },
  { id: 'dept-6', name: 'Legal & Compliance', code: 'LEG', headCount: 10, manager: 'James Mitchell' },
  { id: 'dept-7', name: 'Research & Development', code: 'R&D', headCount: 30, manager: 'Anna Kowalski' },
  { id: 'dept-8', name: 'Facilities', code: 'FAC', headCount: 12, manager: 'Robert Johnson' },
];

export const users: User[] = [
  { id: 'usr-1', name: 'Sarah Chen', email: 'sarah.chen@corp.com', role: 'asset-officer', departmentId: 'dept-1' },
  { id: 'usr-2', name: 'Michael Torres', email: 'michael.torres@corp.com', role: 'department-manager', departmentId: 'dept-2' },
  { id: 'usr-3', name: 'Emily Watson', email: 'emily.watson@corp.com', role: 'department-manager', departmentId: 'dept-3' },
  { id: 'usr-4', name: 'David Park', email: 'david.park@corp.com', role: 'department-manager', departmentId: 'dept-4' },
  { id: 'usr-5', name: 'Lisa Nguyen', email: 'lisa.nguyen@corp.com', role: 'employee', departmentId: 'dept-5' },
  { id: 'usr-6', name: 'James Mitchell', email: 'james.mitchell@corp.com', role: 'auditor', departmentId: 'dept-6' },
  { id: 'usr-7', name: 'Anna Kowalski', email: 'anna.kowalski@corp.com', role: 'verification-coordinator', departmentId: 'dept-7' },
  { id: 'usr-8', name: 'Robert Johnson', email: 'robert.johnson@corp.com', role: 'technician', departmentId: 'dept-8' },
  { id: 'usr-9', name: 'Karen Lee', email: 'karen.lee@corp.com', role: 'employee', departmentId: 'dept-1' },
  { id: 'usr-10', name: 'Tom Bradley', email: 'tom.bradley@corp.com', role: 'employee', departmentId: 'dept-4' },
  { id: 'usr-11', name: 'Nina Patel', email: 'nina.patel@corp.com', role: 'employee', departmentId: 'dept-7' },
  { id: 'usr-12', name: 'Chris Evans', email: 'chris.evans@corp.com', role: 'technician', departmentId: 'dept-8' },
];

const categories = ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Server', 'Network Equipment', 'Phone', 'Furniture', 'Vehicle', 'Lab Equipment'];
const locations = ['Building A - Floor 1', 'Building A - Floor 2', 'Building A - Floor 3', 'Building B - Floor 1', 'Building B - Floor 2', 'Warehouse', 'Data Center', 'Parking Lot'];
const conditions: Asset['condition'][] = ['new', 'good', 'fair', 'needs-repair', 'not-operational'];
const lifecycles: Asset['lifecycle'][] = ['in-use', 'in-storage', 'under-maintenance', 'pending-disposal', 'disposed'];

export const assets: Asset[] = Array.from({ length: 80 }, (_, i) => {
  const deptIdx = i % departments.length;
  const catIdx = i % categories.length;
  const userIdx = i % users.length;
  return {
    id: `asset-${i + 1}`,
    code: `AST-${String(2024000 + i + 1).slice(-6)}`,
    name: `${categories[catIdx]} ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
    category: categories[catIdx],
    type: categories[catIdx],
    brand: ['Dell', 'HP', 'Lenovo', 'Apple', 'Cisco', 'Samsung', 'Steelcase', 'Toyota', 'Agilent'][i % 9],
    model: `Model-${100 + i}`,
    serialNumber: `SN${String(100000 + i * 7)}`,
    departmentId: departments[deptIdx].id,
    assignedTo: i % 5 === 0 ? null : users[userIdx].id,
    location: locations[i % locations.length],
    condition: conditions[i % 5],
    lifecycle: i >= 75 ? 'disposed' : i >= 70 ? 'pending-disposal' : i >= 65 ? 'under-maintenance' : i >= 60 ? 'in-storage' : 'in-use',
    acquisitionDate: `${2020 + (i % 4)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
    acquisitionCost: Math.round((500 + i * 120 + Math.random() * 2000) * 100) / 100,
    lastVerifiedDate: i % 3 === 0 ? null : `2025-${String((i % 6) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    notes: '',
  };
});

export const assignments: Assignment[] = Array.from({ length: 30 }, (_, i) => ({
  id: `asgn-${i + 1}`,
  assetId: assets[i % assets.length].id,
  fromUserId: i % 3 === 0 ? null : users[(i + 1) % users.length].id,
  toUserId: users[i % users.length].id,
  fromDepartmentId: i % 3 === 0 ? null : departments[(i + 1) % departments.length].id,
  toDepartmentId: departments[i % departments.length].id,
  type: (['assign', 'transfer', 'recall'] as const)[i % 3],
  effectiveDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  notes: i % 2 === 0 ? 'Standard assignment' : 'Priority transfer',
  createdAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
}));

export const campaigns: VerificationCampaign[] = [
  { id: 'camp-1', code: 'VER-2025-Q1', year: 2025, name: 'Q1 2025 Full Verification', scope: 'All departments', status: 'completed', startDate: '2025-01-15', dueDate: '2025-03-31', departmentIds: departments.map(d => d.id), totalTasks: 60, completedTasks: 58, discrepancyCount: 7 },
  { id: 'camp-2', code: 'VER-2025-Q2', year: 2025, name: 'Q2 2025 IT & R&D Verification', scope: 'IT, R&D', status: 'active', startDate: '2025-04-01', dueDate: '2025-06-30', departmentIds: ['dept-1', 'dept-7'], totalTasks: 35, completedTasks: 18, discrepancyCount: 3 },
  { id: 'camp-3', code: 'VER-2025-H2', year: 2025, name: 'H2 2025 Operations Audit', scope: 'Operations, Facilities', status: 'draft', startDate: '2025-07-01', dueDate: '2025-12-31', departmentIds: ['dept-4', 'dept-8'], totalTasks: 40, completedTasks: 0, discrepancyCount: 0 },
  { id: 'camp-4', code: 'VER-2024-ANNUAL', year: 2024, name: '2024 Annual Verification', scope: 'All departments', status: 'completed', startDate: '2024-01-10', dueDate: '2024-12-20', departmentIds: departments.map(d => d.id), totalTasks: 72, completedTasks: 72, discrepancyCount: 12 },
];

export const verificationTasks: VerificationTask[] = Array.from({ length: 50 }, (_, i) => {
  const statuses: VerificationTask['status'][] = ['matched', 'discrepancy', 'pending', 'not-started'];
  const status = i < 18 ? statuses[i % 2] : i < 35 ? 'pending' : 'not-started';
  const asset = assets[i % assets.length];
  return {
    id: `vtask-${i + 1}`,
    campaignId: i < 18 ? 'camp-2' : 'camp-1',
    assetId: asset.id,
    assignedTo: users[i % users.length].id,
    status,
    expectedLocation: asset.location,
    expectedCondition: asset.condition,
    expectedAssignee: asset.assignedTo,
    observedLocation: status === 'matched' ? asset.location : status === 'discrepancy' ? locations[(i + 3) % locations.length] : null,
    observedCondition: status === 'matched' ? asset.condition : status === 'discrepancy' ? 'fair' : null,
    observedAssignee: status === 'matched' ? asset.assignedTo : status === 'discrepancy' ? users[(i + 2) % users.length].id : null,
    notes: status === 'discrepancy' ? 'Location mismatch detected' : '',
    verifiedAt: status !== 'not-started' && status !== 'pending' ? `2025-04-${String((i % 28) + 1).padStart(2, '0')}T14:30:00Z` : null,
  };
});

export const discrepancies: Discrepancy[] = Array.from({ length: 15 }, (_, i) => ({
  id: `disc-${i + 1}`,
  campaignId: i < 3 ? 'camp-2' : 'camp-1',
  taskId: `vtask-${(i * 2) + 2}`,
  assetId: assets[i * 3].id,
  type: (['location-mismatch', 'condition-mismatch', 'assignee-mismatch', 'missing-asset'] as const)[i % 4],
  severity: (['low', 'medium', 'high', 'critical'] as const)[i % 4],
  status: (['open', 'investigating', 'resolved', 'escalated'] as const)[i % 4],
  expectedValue: i % 2 === 0 ? 'Building A - Floor 1' : 'Good condition',
  observedValue: i % 2 === 0 ? 'Warehouse' : 'Needs repair',
  rootCause: i % 4 === 2 ? 'Unauthorized move by staff' : null,
  resolution: i % 4 === 2 ? 'Asset relocated to correct position' : null,
  reportedAt: `2025-${String((i % 4) + 1).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}T09:00:00Z`,
  resolvedAt: i % 4 === 2 ? `2025-${String((i % 4) + 1).padStart(2, '0')}-${String(15 + i).padStart(2, '0')}T16:00:00Z` : null,
}));

export const maintenanceRecords: MaintenanceRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: `maint-${i + 1}`,
  assetId: assets[i * 3].id,
  type: (['preventive', 'corrective', 'inspection', 'upgrade'] as const)[i % 4],
  description: ['Routine inspection', 'Fan replacement', 'Firmware update', 'Battery replacement', 'Screen repair'][i % 5],
  status: (['good', 'needs-monitoring', 'under-repair', 'not-ready'] as const)[i % 4],
  scheduledDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-15`,
  completedDate: i % 3 === 0 ? null : `2025-${String((i % 12) + 1).padStart(2, '0')}-${String(16 + (i % 10)).padStart(2, '0')}`,
  cost: Math.round((50 + i * 30 + Math.random() * 500) * 100) / 100,
  technician: users.filter(u => u.role === 'technician')[i % 2]?.name ?? 'Robert Johnson',
  notes: '',
}));

export const disposalRequests: DisposalRequest[] = Array.from({ length: 8 }, (_, i) => ({
  id: `disp-${i + 1}`,
  assetId: assets[70 + i].id,
  reason: ['End of life', 'Irreparable damage', 'Technology obsolescence', 'Cost of maintenance exceeds value'][i % 4],
  status: (['proposed', 'under-review', 'approved', 'rejected', 'completed', 'deferred'] as const)[i % 6],
  requestedBy: users[i % users.length].name,
  requestedAt: `2025-${String((i % 6) + 1).padStart(2, '0')}-10T08:00:00Z`,
  reviewedBy: i >= 2 ? users[0].name : null,
  reviewedAt: i >= 2 ? `2025-${String((i % 6) + 1).padStart(2, '0')}-15T11:00:00Z` : null,
  effectiveDate: i === 4 ? '2025-06-01' : null,
  notes: '',
}));

export const auditLogs: AuditLog[] = Array.from({ length: 40 }, (_, i) => ({
  id: `log-${i + 1}`,
  actor: users[i % users.length].name,
  action: ['Created', 'Updated', 'Assigned', 'Transferred', 'Verified', 'Resolved', 'Approved', 'Disposed'][i % 8],
  entityType: ['Asset', 'Assignment', 'Verification', 'Discrepancy', 'Maintenance', 'Disposal'][i % 6],
  entityName: assets[i % assets.length].name,
  entityId: assets[i % assets.length].id,
  timestamp: `2025-04-${String(14 - (i % 14)).padStart(2, '0')}T${String(8 + (i % 10)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`,
  before: i % 3 === 1 ? 'Good' : null,
  after: i % 3 === 1 ? 'Fair' : null,
  correlationId: `COR-${1000 + Math.floor(i / 3)}`,
}));

export const assetCategories: AssetCategory[] = categories.map((name, i) => ({
  id: `cat-${i + 1}`,
  name,
  code: name.substring(0, 3).toUpperCase(),
  description: `${name} assets`,
  count: assets.filter(a => a.category === name).length,
}));

// Helper lookups
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getDepartmentById = (id: string) => departments.find(d => d.id === id);
export const getAssetById = (id: string) => assets.find(a => a.id === id);
