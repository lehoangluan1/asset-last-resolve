import type {
  User, Department, AssetCategory, Location, Asset, Assignment,
  BorrowRequest, VerificationCampaign, VerificationTask, Discrepancy,
  MaintenanceRecord, DisposalRequest, AuditLog, DemoAccount
} from '@/types';

export const demoAccounts: DemoAccount[] = [
  { username: 'admin', password: 'admin123', role: 'admin', label: 'Auditor / Admin' },
  { username: 'officer', password: 'officer123', role: 'officer', label: 'Asset Officer' },
  { username: 'manager', password: 'manager123', role: 'manager', label: 'Department Manager' },
  { username: 'employee', password: 'employee123', role: 'employee', label: 'Employee' },
  { username: 'technician', password: 'technician123', role: 'technician', label: 'Technician' },
  { username: 'auditor', password: 'auditor123', role: 'auditor', label: 'Auditor' },
];

export const departments: Department[] = [
  { id: 'dept-1', name: 'Information Technology', code: 'IT', managerId: 'user-3', location: 'Building A, Floor 3', employeeCount: 45 },
  { id: 'dept-2', name: 'Human Resources', code: 'HR', managerId: 'user-4', location: 'Building A, Floor 2', employeeCount: 18 },
  { id: 'dept-3', name: 'Finance & Accounting', code: 'FIN', managerId: 'user-5', location: 'Building B, Floor 1', employeeCount: 22 },
  { id: 'dept-4', name: 'Operations', code: 'OPS', managerId: 'user-6', location: 'Building C, Floor 1', employeeCount: 60 },
  { id: 'dept-5', name: 'Marketing', code: 'MKT', managerId: 'user-7', location: 'Building A, Floor 4', employeeCount: 15 },
  { id: 'dept-6', name: 'Legal & Compliance', code: 'LEG', managerId: 'user-8', location: 'Building B, Floor 3', employeeCount: 10 },
  { id: 'dept-7', name: 'Research & Development', code: 'R&D', managerId: 'user-9', location: 'Building D, Floor 2', employeeCount: 30 },
  { id: 'dept-8', name: 'Executive Office', code: 'EXEC', managerId: 'user-10', location: 'Building A, Floor 5', employeeCount: 8 },
];

export const users: User[] = [
  { id: 'user-1', username: 'admin', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'admin', departmentId: 'dept-1', status: 'active', phone: '+1-555-0101', createdAt: '2023-01-15' },
  { id: 'user-2', username: 'officer', name: 'James Wilson', email: 'james.wilson@company.com', role: 'officer', departmentId: 'dept-1', status: 'active', phone: '+1-555-0102', createdAt: '2023-02-01' },
  { id: 'user-3', username: 'manager', name: 'Maria Garcia', email: 'maria.garcia@company.com', role: 'manager', departmentId: 'dept-1', status: 'active', phone: '+1-555-0103', createdAt: '2023-01-20' },
  { id: 'user-4', username: 'employee', name: 'David Kim', email: 'david.kim@company.com', role: 'employee', departmentId: 'dept-2', status: 'active', phone: '+1-555-0104', createdAt: '2023-03-10' },
  { id: 'user-5', username: 'technician', name: 'Alex Johnson', email: 'alex.johnson@company.com', role: 'technician', departmentId: 'dept-3', status: 'active', phone: '+1-555-0105', createdAt: '2023-02-15' },
  { id: 'user-6', username: 'auditor', name: 'Lisa Brown', email: 'lisa.brown@company.com', role: 'auditor', departmentId: 'dept-4', status: 'active', phone: '+1-555-0106', createdAt: '2023-01-25' },
  { id: 'user-7', name: 'Robert Taylor', username: 'rtaylor', email: 'robert.taylor@company.com', role: 'employee', departmentId: 'dept-5', status: 'active', createdAt: '2023-04-01' },
  { id: 'user-8', name: 'Emily Davis', username: 'edavis', email: 'emily.davis@company.com', role: 'manager', departmentId: 'dept-6', status: 'active', createdAt: '2023-03-15' },
  { id: 'user-9', name: 'Michael Lee', username: 'mlee', email: 'michael.lee@company.com', role: 'employee', departmentId: 'dept-7', status: 'inactive', createdAt: '2023-05-01' },
  { id: 'user-10', name: 'Jennifer Martinez', username: 'jmartinez', email: 'jennifer.martinez@company.com', role: 'manager', departmentId: 'dept-8', status: 'active', createdAt: '2023-01-10' },
  { id: 'user-11', name: 'Chris Anderson', username: 'canderson', email: 'chris.anderson@company.com', role: 'employee', departmentId: 'dept-1', status: 'active', createdAt: '2023-06-15' },
  { id: 'user-12', name: 'Amanda White', username: 'awhite', email: 'amanda.white@company.com', role: 'officer', departmentId: 'dept-2', status: 'active', createdAt: '2023-07-01' },
  { id: 'user-13', name: 'Daniel Thompson', username: 'dthompson', email: 'daniel.thompson@company.com', role: 'technician', departmentId: 'dept-4', status: 'locked', createdAt: '2023-04-20' },
  { id: 'user-14', name: 'Rachel Green', username: 'rgreen', email: 'rachel.green@company.com', role: 'employee', departmentId: 'dept-3', status: 'active', createdAt: '2023-08-10' },
  { id: 'user-15', name: 'Kevin Harris', username: 'kharris', email: 'kevin.harris@company.com', role: 'employee', departmentId: 'dept-5', status: 'active', createdAt: '2024-01-05' },
];

export const locations: Location[] = [
  { id: 'loc-1', name: 'IT Lab A', building: 'Building A', floor: '3', room: '301' },
  { id: 'loc-2', name: 'Server Room', building: 'Building A', floor: '3', room: '310' },
  { id: 'loc-3', name: 'HR Office', building: 'Building A', floor: '2', room: '205' },
  { id: 'loc-4', name: 'Finance Wing', building: 'Building B', floor: '1', room: '102' },
  { id: 'loc-5', name: 'Operations Floor', building: 'Building C', floor: '1', room: '100' },
  { id: 'loc-6', name: 'Marketing Hub', building: 'Building A', floor: '4', room: '401' },
  { id: 'loc-7', name: 'Main Warehouse', building: 'Building E', floor: '1' },
  { id: 'loc-8', name: 'R&D Lab', building: 'Building D', floor: '2', room: '201' },
  { id: 'loc-9', name: 'Conference Room A', building: 'Building A', floor: '1', room: '110' },
  { id: 'loc-10', name: 'Executive Suite', building: 'Building A', floor: '5', room: '500' },
];

export const categories: AssetCategory[] = [
  { id: 'cat-1', name: 'Laptops', code: 'LAP', description: 'Portable computers' },
  { id: 'cat-2', name: 'Desktops', code: 'DSK', description: 'Desktop workstations' },
  { id: 'cat-3', name: 'Monitors', code: 'MON', description: 'Display monitors' },
  { id: 'cat-4', name: 'Printers', code: 'PRT', description: 'Printing devices' },
  { id: 'cat-5', name: 'Servers', code: 'SRV', description: 'Server hardware' },
  { id: 'cat-6', name: 'Networking', code: 'NET', description: 'Routers, switches, access points' },
  { id: 'cat-7', name: 'Furniture', code: 'FUR', description: 'Office furniture' },
  { id: 'cat-8', name: 'Vehicles', code: 'VEH', description: 'Company vehicles' },
  { id: 'cat-9', name: 'Projectors', code: 'PRJ', description: 'Projectors and AV equipment' },
  { id: 'cat-10', name: 'Phones', code: 'PHN', description: 'Desk and mobile phones' },
];

const conditions: Asset['condition'][] = ['excellent', 'good', 'fair', 'poor', 'non-functional'];
const lifecyclesArr: Asset['lifecycle'][] = ['in-use', 'in-storage', 'under-maintenance', 'pending-disposal', 'disposed', 'borrowed'];
const assetNames: [string, string][] = [
  ['MacBook Pro 16"', 'cat-1'], ['Dell Latitude 5540', 'cat-1'], ['ThinkPad X1 Carbon', 'cat-1'],
  ['HP EliteDesk 800', 'cat-2'], ['Dell OptiPlex 7090', 'cat-2'],
  ['Dell U2723QE 27"', 'cat-3'], ['LG 34WN80C-B', 'cat-3'],
  ['HP LaserJet Pro', 'cat-4'], ['Canon imageRUNNER', 'cat-4'],
  ['Dell PowerEdge R750', 'cat-5'], ['HP ProLiant DL380', 'cat-5'],
  ['Cisco Catalyst 9300', 'cat-6'], ['Ubiquiti UniFi AP', 'cat-6'],
  ['Herman Miller Aeron', 'cat-7'], ['Steelcase Leap V2', 'cat-7'], ['Standing Desk Pro', 'cat-7'],
  ['Toyota Corolla 2023', 'cat-8'], ['Ford Transit Van', 'cat-8'],
  ['Epson EB-L200F', 'cat-9'], ['BenQ MH733', 'cat-9'],
  ['Cisco IP Phone 8845', 'cat-10'], ['iPhone 15 Pro', 'cat-10'],
];
const brands = ['Apple', 'Dell', 'Lenovo', 'HP', 'Cisco', 'Canon', 'Herman Miller', 'Toyota', 'Ford', 'Epson', 'BenQ', 'LG', 'Ubiquiti', 'Steelcase'];

export const assets: Asset[] = Array.from({ length: 85 }, (_, i) => {
  const seed = assetNames[i % assetNames.length];
  const lcIdx = i < 55 ? 0 : i < 65 ? 1 : i < 72 ? 2 : i < 78 ? 3 : i < 82 ? 4 : 5;
  return {
    id: `asset-${i + 1}`, code: `AST-${String(1000 + i)}`,
    name: `${seed[0]}${i > 21 ? ` #${Math.floor(i / 22) + 1}` : ''}`,
    description: `${seed[0]} assigned for departmental use`,
    categoryId: seed[1], departmentId: departments[i % departments.length].id,
    assignedToId: lcIdx === 1 ? null : users[i % users.length].id,
    locationId: locations[i % locations.length].id,
    condition: conditions[i % 5], lifecycle: lifecyclesArr[lcIdx],
    brand: brands[i % brands.length], model: `Model-${100 + i}`,
    serialNumber: `SN-${String(100000 + i * 137)}`,
    purchaseDate: `${2020 + (i % 5)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
    purchasePrice: Math.round((500 + i * 120) * 100) / 100,
    warrantyExpiry: i % 3 === 0 ? `${2025 + (i % 3)}-06-30` : null,
    borrowable: i % 4 === 0,
    lastVerifiedDate: i % 2 === 0 ? '2025-03-15' : i % 3 === 0 ? '2024-11-20' : null,
    nextVerificationDue: i % 2 === 0 ? '2025-09-15' : '2025-06-30',
    notes: '', createdAt: `${2020 + (i % 5)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  };
});

export const assignments: Assignment[] = Array.from({ length: 40 }, (_, i) => ({
  id: `asgn-${i + 1}`, assetId: assets[i % assets.length].id,
  assetCode: assets[i % assets.length].code, assetName: assets[i % assets.length].name,
  type: (i % 5 === 0 ? 'borrow' : i % 3 === 0 ? 'temporary' : 'permanent') as Assignment['type'],
  fromUserId: i > 0 ? users[(i - 1) % users.length].id : null,
  fromDepartmentId: i > 0 ? departments[(i - 1) % departments.length].id : null,
  toUserId: users[i % users.length].id, toDepartmentId: departments[i % departments.length].id,
  status: (i % 6 === 0 ? 'pending' : i % 8 === 0 ? 'cancelled' : 'completed') as Assignment['status'],
  effectiveDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
  returnDate: i % 5 === 0 ? `2025-${String(Math.min((i % 12) + 2, 12)).padStart(2, '0')}-01` : null,
  notes: i % 3 === 0 ? 'Standard departmental assignment' : '',
  createdAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`, createdBy: users[0].name,
}));

const borrowStatuses: BorrowRequest['status'][] = ['draft', 'pending-approval', 'approved', 'rejected', 'checked-out', 'returned', 'overdue', 'cancelled'];
export const borrowRequests: BorrowRequest[] = Array.from({ length: 35 }, (_, i) => {
  const ba = assets.filter(a => a.borrowable);
  const asset = ba[i % ba.length] || assets[i];
  const req = users[(i + 3) % users.length];
    return {
      id: `borrow-${i + 1}`, assetId: asset.id, assetCode: asset.code, assetName: asset.name,
      categoryId: asset.categoryId, categoryCode: categories.find(category => category.id === asset.categoryId)?.code || 'GEN', categoryName: asset.categoryName || 'General',
      requesterId: req.id, requesterName: req.name, departmentId: req.departmentId,
      departmentName: departments.find(department => department.id === req.departmentId)?.name,
      targetType: 'individual' as const,
      borrowDate: `2025-${String((i % 6) + 4).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      returnDate: `2025-${String((i % 6) + 5).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      purpose: ['Team meeting presentation', 'Client demo', 'Quarterly review', 'Training session', 'Off-site event', 'Temporary replacement'][i % 6],
    notes: i % 3 === 0 ? 'Please ensure the equipment is charged.' : '',
    status: borrowStatuses[i % borrowStatuses.length],
    approvedBy: i % 3 === 0 ? users[1].id : null, approverNotes: i % 4 === 0 ? 'Approved for the requested period.' : '',
    checkedOutAt: i % 8 === 4 ? `2025-${String((i % 6) + 4).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : null,
    returnedAt: i % 8 === 5 ? `2025-${String((i % 6) + 5).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : null,
    createdAt: `2025-${String((i % 6) + 3).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  };
});

export const campaigns: VerificationCampaign[] = [
  { id: 'camp-1', code: 'VER-2025-Q1', name: 'Q1 2025 Full Verification', year: 2025, scope: 'All Departments', departmentIds: departments.map(d => d.id), status: 'completed', dueDate: '2025-03-31', startDate: '2025-01-15', totalTasks: 85, completedTasks: 85, discrepancyCount: 7, createdAt: '2025-01-10' },
  { id: 'camp-2', code: 'VER-2025-Q2', name: 'Q2 2025 IT & Operations', year: 2025, scope: 'IT, Operations', departmentIds: ['dept-1', 'dept-4'], status: 'active', dueDate: '2025-06-30', startDate: '2025-04-01', totalTasks: 42, completedTasks: 28, discrepancyCount: 3, createdAt: '2025-03-25' },
  { id: 'camp-3', code: 'VER-2025-Q3', name: 'Q3 2025 Annual Review', year: 2025, scope: 'All Departments', departmentIds: departments.map(d => d.id), status: 'draft', dueDate: '2025-09-30', startDate: '2025-07-01', totalTasks: 85, completedTasks: 0, discrepancyCount: 0, createdAt: '2025-06-01' },
];

export const verificationTasks: VerificationTask[] = Array.from({ length: 50 }, (_, i) => {
  const asset = assets[i % assets.length]; const loc = locations[i % locations.length];
  const isM = i % 5 !== 0;
  return {
    id: `vtask-${i + 1}`, campaignId: i < 30 ? 'camp-1' : 'camp-2',
    assetId: asset.id, assetCode: asset.code, assetName: asset.name,
    assignedToId: users[i % users.length].id,
    expectedLocation: loc.name, expectedCondition: asset.condition, expectedAssignee: users[i % users.length].name,
    observedLocation: isM ? loc.name : locations[(i + 3) % locations.length].name,
    observedCondition: isM ? asset.condition : (i % 3 === 0 ? 'poor' : 'fair'),
    observedAssignee: isM ? users[i % users.length].name : users[(i + 2) % users.length].name,
    result: i >= 42 ? 'pending' as const : isM ? 'matched' as const : 'discrepancy' as const,
    notes: !isM ? 'Location mismatch found during verification' : '',
    verifiedAt: i < 42 ? `2025-${String((i % 3) + 3).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : null,
  };
});

const dSev: Discrepancy['severity'][] = ['low', 'medium', 'high', 'critical'];
const dTyp: Discrepancy['type'][] = ['location', 'condition', 'assignee', 'missing', 'other'];
const dSta: Discrepancy['status'][] = ['open', 'investigating', 'resolved', 'escalated'];
export const discrepancies: Discrepancy[] = Array.from({ length: 25 }, (_, i) => {
  const t = verificationTasks.filter(x => x.result === 'discrepancy')[i % 10] || verificationTasks[i];
  return {
    id: `disc-${i + 1}`, campaignId: t.campaignId, taskId: t.id,
    assetId: t.assetId, assetCode: t.assetCode, assetName: t.assetName,
    type: dTyp[i % dTyp.length], severity: dSev[i % dSev.length], status: dSta[i % dSta.length],
    expectedValue: t.expectedLocation, observedValue: t.observedLocation,
    rootCause: ['Unauthorized relocation', 'Record not updated', 'Unknown'][i % 3],
    resolution: i % 4 === 2 ? 'Updated asset location in system' : '',
    resolvedBy: i % 4 === 2 ? users[0].id : null, resolvedAt: i % 4 === 2 ? '2025-04-10' : null,
    createdAt: `2025-${String((i % 4) + 2).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  };
});

export const maintenanceRecords: MaintenanceRecord[] = Array.from({ length: 30 }, (_, i) => ({
  id: `maint-${i + 1}`, assetId: assets[i % assets.length].id,
  assetCode: assets[i % assets.length].code, assetName: assets[i % assets.length].name,
  type: ['Preventive', 'Corrective', 'Inspection', 'Calibration'][i % 4],
  description: ['Routine maintenance check', 'Hardware repair', 'Software update', 'Component replacement'][i % 4],
  techCondition: (['good', 'needs-monitoring', 'under-repair', 'not-ready'] as const)[i % 4],
  status: (['scheduled', 'in-progress', 'completed', 'cancelled'] as const)[i % 4],
    priority: (['low', 'normal', 'high', 'urgent'] as const)[i % 4],
    assignedToId: users[4].id,
    assignedTo: users[4].name,
  scheduledDate: `2025-${String((i % 6) + 4).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  completedDate: i % 4 === 2 ? `2025-${String((i % 6) + 4).padStart(2, '0')}-${String(Math.min((i % 28) + 5, 28)).padStart(2, '0')}` : null,
  cost: Math.round((50 + i * 35) * 100) / 100, notes: i % 3 === 0 ? 'Parts ordered' : '',
  createdAt: `2025-${String((i % 6) + 3).padStart(2, '0')}-15`,
}));

export const disposalRequests: DisposalRequest[] = Array.from({ length: 20 }, (_, i) => ({
  id: `disp-${i + 1}`, assetId: assets[(i + 70) % assets.length].id,
  assetCode: assets[(i + 70) % assets.length].code, assetName: assets[(i + 70) % assets.length].name,
  reason: ['End of life', 'Irreparable damage', 'Obsolete technology', 'Surplus equipment'][i % 4],
  status: (['proposed', 'under-review', 'approved', 'rejected', 'deferred', 'completed'] as const)[i % 6],
  proposedBy: users[i % users.length].name,
  reviewedBy: i % 3 === 0 ? users[0].name : null,
  effectiveDate: i % 3 === 2 ? `2025-${String((i % 6) + 6).padStart(2, '0')}-01` : null,
  estimatedValue: Math.round((10 + i * 25) * 100) / 100, notes: i % 4 === 0 ? 'Recommend recycling' : '',
  createdAt: `2025-${String((i % 4) + 3).padStart(2, '0')}-01`,
}));

const actns = ['Created', 'Updated', 'Assigned', 'Transferred', 'Verified', 'Approved', 'Rejected', 'Disposed', 'Maintained', 'Borrowed', 'Returned'];
const eTypes = ['Asset', 'Assignment', 'BorrowRequest', 'Campaign', 'Discrepancy', 'Maintenance', 'Disposal', 'User'];
export const auditLogs: AuditLog[] = Array.from({ length: 60 }, (_, i) => ({
  id: `log-${i + 1}`, actor: users[i % users.length].name,
  action: actns[i % actns.length], entityType: eTypes[i % eTypes.length],
  entityId: `entity-${i + 1}`,
  entityName: i % 2 === 0 ? assets[i % assets.length].name : `Record #${i + 1}`,
  timestamp: new Date(2025, 2 + Math.floor(i / 20), (i % 28) + 1, 8 + (i % 10), i % 60).toISOString(),
  details: `${actns[i % actns.length]} ${eTypes[i % eTypes.length].toLowerCase()}`,
  correlationId: `COR-${String(1000 + i)}`,
}));

export function getDepartmentById(id: string) { return departments.find(d => d.id === id); }
export function getUserById(id: string) { return users.find(u => u.id === id); }
export function getLocationById(id: string) { return locations.find(l => l.id === id); }
export function getCategoryById(id: string) { return categories.find(c => c.id === id); }
