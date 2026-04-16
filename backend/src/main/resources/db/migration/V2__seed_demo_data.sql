INSERT INTO departments (id, name, code, location, employee_count)
VALUES
    ('00000000-0000-0000-0000-000000000101', 'Information Technology', 'IT', 'Building A, Floor 3', 14),
    ('00000000-0000-0000-0000-000000000102', 'Human Resources', 'HR', 'Building A, Floor 2', 8),
    ('00000000-0000-0000-0000-000000000103', 'Finance & Accounting', 'FIN', 'Building B, Floor 1', 9),
    ('00000000-0000-0000-0000-000000000104', 'Operations', 'OPS', 'Building C, Floor 1', 16),
    ('00000000-0000-0000-0000-000000000105', 'Legal & Compliance', 'LEG', 'Building B, Floor 3', 6);

INSERT INTO locations (id, name, building, floor, room)
VALUES
    ('00000000-0000-0000-0000-000000000201', 'IT Lab A', 'Building A', '3', '301'),
    ('00000000-0000-0000-0000-000000000202', 'Server Room', 'Building A', '3', '310'),
    ('00000000-0000-0000-0000-000000000203', 'HR Office', 'Building A', '2', '205'),
    ('00000000-0000-0000-0000-000000000204', 'Finance Wing', 'Building B', '1', '102'),
    ('00000000-0000-0000-0000-000000000205', 'Operations Floor', 'Building C', '1', '100'),
    ('00000000-0000-0000-0000-000000000206', 'Warehouse', 'Building E', '1', NULL),
    ('00000000-0000-0000-0000-000000000207', 'Compliance Office', 'Building B', '3', '308');

INSERT INTO asset_categories (
    id, name, code, description, borrowable_by_default, requires_serial, requires_verification, status
)
VALUES
    ('00000000-0000-0000-0000-000000000301', 'Laptops', 'LAP', 'Portable computers', TRUE, TRUE, TRUE, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000302', 'Monitors', 'MON', 'Display monitors', FALSE, TRUE, TRUE, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000303', 'Printers', 'PRT', 'Printing devices', FALSE, TRUE, TRUE, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000304', 'Servers', 'SRV', 'Server hardware', FALSE, TRUE, TRUE, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000305', 'Projectors', 'PRJ', 'Projectors and AV equipment', TRUE, TRUE, TRUE, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000306', 'Networking', 'NET', 'Network infrastructure', FALSE, TRUE, TRUE, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000307', 'Phones', 'PHN', 'Mobile and desk phones', TRUE, TRUE, TRUE, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000308', 'Vehicles', 'VEH', 'Company fleet', FALSE, TRUE, TRUE, 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000309', 'Furniture', 'FUR', 'Office furniture', FALSE, FALSE, TRUE, 'ACTIVE');

INSERT INTO users (
    id, username, full_name, email, password_hash, role, status, department_id, phone, bio, last_login_at
)
VALUES
    ('00000000-0000-0000-0000-000000000401', 'admin', 'Sarah Chen', 'sarah.chen@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'ADMIN', 'ACTIVE', '00000000-0000-0000-0000-000000000101', '+1-555-0101', 'System administrator responsible for enterprise governance.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000000402', 'officer', 'James Wilson', 'james.wilson@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'OFFICER', 'ACTIVE', '00000000-0000-0000-0000-000000000101', '+1-555-0102', 'Asset officer managing lifecycle operations.', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
    ('00000000-0000-0000-0000-000000000403', 'manager', 'Maria Garcia', 'maria.garcia@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'MANAGER', 'ACTIVE', '00000000-0000-0000-0000-000000000101', '+1-555-0103', 'Department manager for Information Technology.', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    ('00000000-0000-0000-0000-000000000404', 'employee', 'David Kim', 'david.kim@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'EMPLOYEE', 'ACTIVE', '00000000-0000-0000-0000-000000000102', '+1-555-0104', 'HR coordinator and standard requester account.', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
    ('00000000-0000-0000-0000-000000000405', 'technician', 'Alex Johnson', 'alex.johnson@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'TECHNICIAN', 'ACTIVE', '00000000-0000-0000-0000-000000000104', '+1-555-0105', 'Field technician handling maintenance workloads.', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
    ('00000000-0000-0000-0000-000000000406', 'auditor', 'Lisa Brown', 'lisa.brown@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'AUDITOR', 'ACTIVE', '00000000-0000-0000-0000-000000000105', '+1-555-0106', 'Compliance auditor responsible for verification campaigns.', CURRENT_TIMESTAMP - INTERVAL '7 hours'),
    ('00000000-0000-0000-0000-000000000407', 'emily', 'Emily Davis', 'emily.davis@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'MANAGER', 'ACTIVE', '00000000-0000-0000-0000-000000000102', '+1-555-0107', 'HR manager overseeing departmental approvals.', CURRENT_TIMESTAMP - INTERVAL '9 hours'),
    ('00000000-0000-0000-0000-000000000408', 'kevin', 'Kevin Harris', 'kevin.harris@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'MANAGER', 'ACTIVE', '00000000-0000-0000-0000-000000000104', '+1-555-0108', 'Operations manager for equipment-heavy workflows.', CURRENT_TIMESTAMP - INTERVAL '10 hours'),
    ('00000000-0000-0000-0000-000000000409', 'rgreen', 'Rachel Green', 'rachel.green@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'EMPLOYEE', 'ACTIVE', '00000000-0000-0000-0000-000000000103', '+1-555-0109', 'Finance analyst with frequent equipment borrowing needs.', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    ('00000000-0000-0000-0000-000000000410', 'canderson', 'Chris Anderson', 'chris.anderson@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'EMPLOYEE', 'ACTIVE', '00000000-0000-0000-0000-000000000101', '+1-555-0110', 'IT support specialist with assigned laptop assets.', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
    ('00000000-0000-0000-0000-000000000411', 'opsadmin', 'Nina Patel', 'nina.patel@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'ADMIN', 'ACTIVE', '00000000-0000-0000-0000-000000000105', '+1-555-0111', 'Backup enterprise administrator for governance and compliance.', CURRENT_TIMESTAMP - INTERVAL '11 hours'),
    ('00000000-0000-0000-0000-000000000412', 'assetlead', 'Owen Brooks', 'owen.brooks@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'OFFICER', 'ACTIVE', '00000000-0000-0000-0000-000000000104', '+1-555-0112', 'Regional asset lead supporting operations and warehouse assets.', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
    ('00000000-0000-0000-0000-000000000413', 'mlopez', 'Mia Lopez', 'mia.lopez@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'TECHNICIAN', 'ACTIVE', '00000000-0000-0000-0000-000000000101', '+1-555-0113', 'Senior technician responsible for workstation repairs.', CURRENT_TIMESTAMP - INTERVAL '13 hours'),
    ('00000000-0000-0000-0000-000000000414', 'qauditor', 'Quinn Foster', 'quinn.foster@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'AUDITOR', 'ACTIVE', '00000000-0000-0000-0000-000000000105', '+1-555-0114', 'Verification specialist focused on control testing.', CURRENT_TIMESTAMP - INTERVAL '14 hours'),
    ('00000000-0000-0000-0000-000000000415', 'inactivehr', 'Irene Mills', 'irene.mills@company.com', '$2a$10$sBnaMnJ.Jq4saEF.Oley..fWUtrve8RRfwLl/HGMXuZF6WcyRv6Li', 'EMPLOYEE', 'INACTIVE', '00000000-0000-0000-0000-000000000102', '+1-555-0115', 'Inactive HR demo account for authentication hardening tests.', CURRENT_TIMESTAMP - INTERVAL '20 days');

UPDATE departments AS d
SET manager_user_id = u.id
FROM (
    VALUES
        ('IT', 'manager'),
        ('HR', 'emily'),
        ('OPS', 'kevin')
) AS mapping(department_code, manager_username)
JOIN users AS u
    ON u.username = mapping.manager_username
WHERE d.code = mapping.department_code;

INSERT INTO assets (
    id, code, name, description, category_id, department_id, assigned_to_user_id, location_id,
    condition, lifecycle_status, brand, model, serial_number, purchase_date, purchase_price,
    warranty_expiry, borrowable, last_verified_date, next_verification_due, notes, created_by_id, updated_by_id
)
VALUES
    ('00000000-0000-0000-0000-000000000501', 'AST-1000', 'MacBook Pro 16"', 'Executive laptop assigned to IT support.', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000201', 'EXCELLENT', 'IN_USE', 'Apple', 'MacBook Pro M3', 'SN-MBP-16001', DATE '2024-01-15', 2799.00, DATE '2027-01-15', TRUE, DATE '2026-03-15', DATE '2026-09-15', 'Primary support laptop.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000502', 'AST-1001', 'Dell Latitude 5540', 'Shared HR laptop for interviews and onboarding.', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000102', NULL, '00000000-0000-0000-0000-000000000203', 'GOOD', 'IN_STORAGE', 'Dell', 'Latitude 5540', 'SN-DEL-55401', DATE '2024-05-10', 1620.00, DATE '2027-05-10', TRUE, DATE '2026-02-11', DATE '2026-08-11', 'Available for short-term borrowing.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000503', 'AST-1002', 'HP LaserJet Pro', 'Main office printer pending maintenance completion.', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000102', NULL, '00000000-0000-0000-0000-000000000203', 'FAIR', 'UNDER_MAINTENANCE', 'HP', 'LaserJet Pro 400', 'SN-HP-PRT-3321', DATE '2021-03-09', 650.00, DATE '2026-03-09', FALSE, DATE '2025-12-15', DATE '2026-06-15', 'Paper feed issue reported twice this quarter.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000405'),
    ('00000000-0000-0000-0000-000000000504', 'AST-1003', 'Dell PowerEdge R750', 'Primary virtualization host.', '00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000101', NULL, '00000000-0000-0000-0000-000000000202', 'GOOD', 'IN_USE', 'Dell', 'PowerEdge R750', 'SN-SRV-75001', DATE '2023-07-01', 9800.00, DATE '2028-07-01', FALSE, DATE '2026-01-10', DATE '2026-07-10', 'Critical infrastructure asset.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000505', 'AST-1004', 'Epson EB-L200F', 'Portable projector for finance presentations.', '00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000103', NULL, '00000000-0000-0000-0000-000000000204', 'GOOD', 'IN_STORAGE', 'Epson', 'EB-L200F', 'SN-EP-200F-01', DATE '2023-10-12', 1499.00, DATE '2026-10-12', TRUE, DATE '2026-03-01', DATE '2026-09-01', 'Frequently used for quarterly business reviews.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000506', 'AST-1005', 'Cisco Catalyst 9300', 'Access switch for operations floor.', '00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000104', NULL, '00000000-0000-0000-0000-000000000205', 'GOOD', 'IN_USE', 'Cisco', 'Catalyst 9300', 'SN-NET-9300-1', DATE '2022-04-22', 5200.00, DATE '2027-04-22', FALSE, DATE '2025-11-20', DATE '2026-05-20', 'Supports scanners and floor terminals.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000507', 'AST-1006', 'iPhone 15 Pro', 'Loaner device currently checked out to HR.', '00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000203', 'GOOD', 'BORROWED', 'Apple', 'iPhone 15 Pro', 'SN-PHN-15001', DATE '2024-02-18', 1099.00, DATE '2027-02-18', TRUE, DATE '2026-03-20', DATE '2026-09-20', 'Temporary device for recruitment event coverage.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000508', 'AST-1007', 'Standing Desk Pro', 'Desk scheduled for disposal due to damage.', '00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000102', NULL, '00000000-0000-0000-0000-000000000206', 'POOR', 'PENDING_DISPOSAL', 'FlexiSpot', 'Desk Pro', 'SN-FUR-DSK-07', DATE '2020-08-14', 699.00, NULL, FALSE, DATE '2025-10-20', DATE '2026-04-20', 'Frame instability observed during inspection.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000509', 'AST-1008', 'Toyota Corolla 2023', 'Shared operational vehicle.', '00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000104', NULL, '00000000-0000-0000-0000-000000000206', 'GOOD', 'IN_USE', 'Toyota', 'Corolla 2023', 'SN-VEH-23001', DATE '2023-01-12', 23250.00, DATE '2028-01-12', FALSE, DATE '2026-01-05', DATE '2026-07-05', 'Assigned through fleet booking desk.', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000401'),
    ('00000000-0000-0000-0000-000000000510', 'AST-1009', 'ThinkPad X1 Carbon', 'HR business partner laptop.', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000203', 'GOOD', 'IN_USE', 'Lenovo', 'X1 Carbon Gen 11', 'SN-LEN-X1-44', DATE '2024-06-01', 1850.00, DATE '2027-06-01', TRUE, DATE '2026-02-20', DATE '2026-08-20', 'Assigned to David Kim.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000511', 'AST-1010', 'LG 34WN80C-B', 'Retired monitor awaiting archival disposal closure.', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000103', NULL, '00000000-0000-0000-0000-000000000204', 'NON_FUNCTIONAL', 'DISPOSED', 'LG', '34WN80C-B', 'SN-LG-3480-1', DATE '2019-11-04', 799.00, NULL, FALSE, DATE '2025-09-10', NULL, 'Disposed after panel failure.', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000401'),
    ('00000000-0000-0000-0000-000000000512', 'AST-1011', 'Canon imageRUNNER', 'Warehouse print station spare.', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000104', NULL, '00000000-0000-0000-0000-000000000206', 'GOOD', 'IN_STORAGE', 'Canon', 'imageRUNNER 2425', 'SN-CAN-2425-1', DATE '2022-12-15', 1300.00, DATE '2026-12-15', FALSE, DATE '2025-12-01', DATE '2026-06-01', 'Backup print station.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000513', 'AST-1012', 'Surface Laptop 6', 'Compliance review laptop assigned to audit operations.', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000414', '00000000-0000-0000-0000-000000000207', 'GOOD', 'IN_USE', 'Microsoft', 'Surface Laptop 6', 'SN-SURF-6001', DATE '2025-02-11', 1745.00, DATE '2028-02-11', TRUE, DATE '2026-03-11', DATE '2026-09-11', 'Used for evidence capture and control walkthroughs.', '00000000-0000-0000-0000-000000000411', '00000000-0000-0000-0000-000000000411'),
    ('00000000-0000-0000-0000-000000000514', 'AST-1013', 'Samsung Galaxy Tab S9', 'Operations field tablet available for dispatch borrowing.', '00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000104', NULL, '00000000-0000-0000-0000-000000000205', 'GOOD', 'IN_STORAGE', 'Samsung', 'Galaxy Tab S9', 'SN-TAB-S9001', DATE '2025-06-08', 899.00, DATE '2028-06-08', TRUE, DATE '2026-04-01', DATE '2026-10-01', 'Held for route inspections and field sign-offs.', '00000000-0000-0000-0000-000000000412', '00000000-0000-0000-0000-000000000412'),
    ('00000000-0000-0000-0000-000000000515', 'AST-1014', 'HP EliteBook 840 G11', 'Unused HR reserve laptop for temporary borrowing.', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000102', NULL, '00000000-0000-0000-0000-000000000203', 'GOOD', 'IN_STORAGE', 'HP', 'EliteBook 840 G11', 'SN-HP-HR-8401', DATE '2025-01-20', 1580.00, DATE '2028-01-20', TRUE, DATE '2026-03-10', DATE '2026-09-10', 'Kept as a department spare for borrowing and onboarding coverage.', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402');

INSERT INTO assignments (
    id, asset_id, assignment_type, from_user_id, from_department_id, to_user_id, to_department_id,
    status, effective_date, return_date, notes, created_by_id
)
VALUES
    ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000501', 'PERMANENT', NULL, '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000101', 'COMPLETED', DATE '2025-01-10', NULL, 'New joiner onboarding allocation.', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000510', 'PERMANENT', NULL, '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000102', 'COMPLETED', DATE '2025-09-01', NULL, 'Primary workstation assignment.', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000505', 'BORROW', NULL, '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000409', '00000000-0000-0000-0000-000000000103', 'PENDING', DATE '2026-04-22', DATE '2026-04-25', 'Awaiting projector checkout approval.', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000507', 'BORROW', NULL, '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000102', 'COMPLETED', DATE '2026-04-12', DATE '2026-04-18', 'Recruitment event loaner phone.', '00000000-0000-0000-0000-000000000402'),
    ('00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000503', 'TEMPORARY', NULL, '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000104', 'COMPLETED', DATE '2026-03-01', DATE '2026-03-30', 'Printer reassigned to maintenance team.', '00000000-0000-0000-0000-000000000402');

INSERT INTO borrow_requests (
    id, asset_id, requester_id, department_id, borrow_date, return_date, purpose, notes, status,
    approved_by_id, approver_notes, checked_out_at, returned_at, decision_at, created_at
)
VALUES
    ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000409', '00000000-0000-0000-0000-000000000103', DATE '2026-04-22', DATE '2026-04-25', 'Quarterly review presentation', 'Needs HDMI adapter.', 'PENDING_APPROVAL', NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000102', DATE '2026-04-17', DATE '2026-04-19', 'Interview panel laptop', 'Reserved for on-site candidate sessions.', 'APPROVED', '00000000-0000-0000-0000-000000000407', 'Approved for interview block.', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000507', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000102', DATE '2026-04-12', DATE '2026-04-18', 'Campus recruitment event', 'Camera coverage needed during fair.', 'CHECKED_OUT', '00000000-0000-0000-0000-000000000407', 'Approved and checked out.', CURRENT_TIMESTAMP - INTERVAL '4 days', NULL, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000101', DATE '2026-04-01', DATE '2026-04-05', 'Temporary replacement', 'Original laptop at repair bench.', 'RETURNED', '00000000-0000-0000-0000-000000000402', 'Returned on time.', CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '11 days', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '16 days'),
    ('00000000-0000-0000-0000-000000000705', '00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000102', DATE '2026-03-20', DATE '2026-03-22', 'Training session', 'No longer needed after agenda change.', 'REJECTED', '00000000-0000-0000-0000-000000000407', 'Rejected because the projector was already reserved.', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '21 days'),
    ('00000000-0000-0000-0000-000000000706', '00000000-0000-0000-0000-000000000507', '00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000101', DATE '2026-04-01', DATE '2026-04-07', 'Field demo support', 'Still outstanding after scheduled return date.', 'OVERDUE', '00000000-0000-0000-0000-000000000402', 'Return reminder sent.', CURRENT_TIMESTAMP - INTERVAL '15 days', NULL, CURRENT_TIMESTAMP - INTERVAL '16 days', CURRENT_TIMESTAMP - INTERVAL '17 days');

INSERT INTO verification_campaigns (
    id, code, name, year, scope, description, status, due_date, start_date, created_by_id, created_at
)
VALUES
    ('00000000-0000-0000-0000-000000000801', 'VER-2026-Q1', 'Q1 2026 Enterprise Verification', 2026, 'All Departments', 'Completed verification campaign for enterprise asset spot checks.', 'COMPLETED', DATE '2026-03-31', DATE '2026-01-20', '00000000-0000-0000-0000-000000000406', CURRENT_TIMESTAMP - INTERVAL '90 days'),
    ('00000000-0000-0000-0000-000000000802', 'VER-2026-Q2', 'Q2 2026 IT and Operations Verification', 2026, 'IT, OPS', 'Current active campaign covering critical operational assets.', 'ACTIVE', DATE '2026-06-30', DATE '2026-04-01', '00000000-0000-0000-0000-000000000406', CURRENT_TIMESTAMP - INTERVAL '15 days');

INSERT INTO verification_campaign_departments (campaign_id, department_id)
VALUES
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000101'),
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000102'),
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000103'),
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000104'),
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000105'),
    ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000101'),
    ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000104');

INSERT INTO verification_tasks (
    id, campaign_id, asset_id, assigned_to_user_id, expected_location_id, expected_condition,
    expected_assignee_id, observed_location_id, observed_condition, observed_assignee_id,
    result, notes, verified_at, verified_by_id
)
VALUES
    ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000406', '00000000-0000-0000-0000-000000000201', 'EXCELLENT', '00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000201', 'EXCELLENT', '00000000-0000-0000-0000-000000000410', 'MATCHED', 'Asset confirmed in expected workspace.', CURRENT_TIMESTAMP - INTERVAL '3 days', '00000000-0000-0000-0000-000000000406'),
    ('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000406', '00000000-0000-0000-0000-000000000202', 'GOOD', NULL, '00000000-0000-0000-0000-000000000205', 'GOOD', NULL, 'DISCREPANCY', 'Server inventory location tag was outdated.', CURRENT_TIMESTAMP - INTERVAL '2 days', '00000000-0000-0000-0000-000000000406'),
    ('00000000-0000-0000-0000-000000000903', '00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000506', '00000000-0000-0000-0000-000000000406', '00000000-0000-0000-0000-000000000205', 'GOOD', NULL, '00000000-0000-0000-0000-000000000205', 'FAIR', NULL, 'DISCREPANCY', 'Observed wear and cable strain on the switch rack.', CURRENT_TIMESTAMP - INTERVAL '1 day', '00000000-0000-0000-0000-000000000406'),
    ('00000000-0000-0000-0000-000000000904', '00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000509', '00000000-0000-0000-0000-000000000406', '00000000-0000-0000-0000-000000000206', 'GOOD', NULL, NULL, NULL, NULL, 'PENDING', 'Warehouse verification still pending.', NULL, NULL);

INSERT INTO discrepancies (
    id, campaign_id, task_id, asset_id, type, severity, status, expected_value, observed_value,
    root_cause, resolution, resolved_by_id, resolved_at, created_by_id
)
VALUES
    ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000504', 'LOCATION', 'HIGH', 'INVESTIGATING', 'Server Room', 'Operations Floor', 'Rack move was not logged after network maintenance.', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000406'),
    ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000903', '00000000-0000-0000-0000-000000000506', 'CONDITION', 'MEDIUM', 'OPEN', 'good', 'fair', 'Cooling airflow was partially obstructed.', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000406');

INSERT INTO maintenance_records (
    id, asset_id, maintenance_type, description, tech_condition, status, priority, assigned_to_user_id,
    scheduled_date, completed_date, cost, notes, created_by_id, created_at
)
VALUES
    ('00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000503', 'Corrective', 'Paper feed roller replacement and printer alignment.', 'UNDER_REPAIR', 'IN_PROGRESS', 'HIGH', '00000000-0000-0000-0000-000000000405', DATE '2026-04-14', NULL, 185.00, 'Replacement rollers ordered.', '00000000-0000-0000-0000-000000000402', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('00000000-0000-0000-0000-000000001102', '00000000-0000-0000-0000-000000000506', 'Inspection', 'Post-verification condition review for switch cabinet.', 'NEEDS_MONITORING', 'SCHEDULED', 'NORMAL', '00000000-0000-0000-0000-000000000405', DATE '2026-04-18', NULL, 0, 'Triggered from discrepancy review.', '00000000-0000-0000-0000-000000000406', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000001103', '00000000-0000-0000-0000-000000000507', 'Inspection', 'Loaner phone battery health review before next checkout.', 'GOOD', 'COMPLETED', 'LOW', '00000000-0000-0000-0000-000000000405', DATE '2026-04-08', DATE '2026-04-09', 35.00, 'No issues found.', '00000000-0000-0000-0000-000000000402', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    ('00000000-0000-0000-0000-000000001104', '00000000-0000-0000-0000-000000000509', 'Preventive', 'Vehicle safety and tire inspection.', 'GOOD', 'SCHEDULED', 'NORMAL', '00000000-0000-0000-0000-000000000405', DATE '2026-04-25', NULL, 120.00, 'Routine fleet maintenance.', '00000000-0000-0000-0000-000000000408', CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO disposal_requests (
    id, asset_id, reason, status, proposed_by_id, reviewed_by_id, effective_date, estimated_value, notes, created_at
)
VALUES
    ('00000000-0000-0000-0000-000000001201', '00000000-0000-0000-0000-000000000508', 'Irreparable frame instability after repeated repairs.', 'UNDER_REVIEW', '00000000-0000-0000-0000-000000000407', NULL, NULL, 150.00, 'Recommend office furniture recycling vendor.', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    ('00000000-0000-0000-0000-000000001202', '00000000-0000-0000-0000-000000000511', 'Panel failure and no viable replacement parts.', 'COMPLETED', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000401', DATE '2026-03-30', 40.00, 'Disposed via certified electronics recycler.', CURRENT_TIMESTAMP - INTERVAL '25 days'),
    ('00000000-0000-0000-0000-000000001203', '00000000-0000-0000-0000-000000000512', 'Storage consolidation identified this printer as surplus.', 'PROPOSED', '00000000-0000-0000-0000-000000000408', NULL, NULL, 180.00, 'Awaiting operations review.', CURRENT_TIMESTAMP - INTERVAL '3 days');

INSERT INTO notifications (
    id, recipient_user_id, title, message, type, entity_type, entity_id, actor_name, priority, is_read, created_at
)
VALUES
    ('00000000-0000-0000-0000-000000001301', '00000000-0000-0000-0000-000000000402', 'Borrow request pending', 'Rachel Green requested Epson EB-L200F for the quarterly review presentation.', 'borrow-pending', 'BorrowRequest', '00000000-0000-0000-0000-000000000701', 'Rachel Green', 'high', FALSE, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    ('00000000-0000-0000-0000-000000001302', '00000000-0000-0000-0000-000000000404', 'Borrow request approved', 'Your request for Dell Latitude 5540 was approved by Emily Davis.', 'borrow-approved', 'BorrowRequest', '00000000-0000-0000-0000-000000000702', 'Emily Davis', 'normal', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000001303', '00000000-0000-0000-0000-000000000406', 'Verification task assigned', 'You have pending IT and operations verification tasks for VER-2026-Q2.', 'verification-assigned', 'Campaign', '00000000-0000-0000-0000-000000000802', 'System', 'high', FALSE, CURRENT_TIMESTAMP - INTERVAL '8 hours'),
    ('00000000-0000-0000-0000-000000001304', '00000000-0000-0000-0000-000000000405', 'Maintenance scheduled', 'Switch cabinet inspection has been assigned to you.', 'general', 'Maintenance', '00000000-0000-0000-0000-000000001102', 'Lisa Brown', 'normal', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000001305', '00000000-0000-0000-0000-000000000401', 'Disposal request awaiting review', 'Standing Desk Pro has been submitted for disposal review.', 'disposal-review', 'Disposal', '00000000-0000-0000-0000-000000001201', 'Emily Davis', 'high', FALSE, CURRENT_TIMESTAMP - INTERVAL '6 days'),
    ('00000000-0000-0000-0000-000000001306', '00000000-0000-0000-0000-000000000410', 'Asset overdue for return', 'The loaner iPhone 15 Pro is past its scheduled return date.', 'asset-overdue', 'Asset', '00000000-0000-0000-0000-000000000507', 'System', 'high', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO audit_logs (
    id, actor_user_id, actor_name, action, entity_type, entity_id, entity_name, details, correlation_id, created_at
)
VALUES
    ('00000000-0000-0000-0000-000000001401', '00000000-0000-0000-0000-000000000402', 'James Wilson', 'Created Asset', 'Asset', '00000000-0000-0000-0000-000000000505', 'Epson EB-L200F', 'Registered projector for finance department use.', 'COR-1001', CURRENT_TIMESTAMP - INTERVAL '30 days'),
    ('00000000-0000-0000-0000-000000001402', '00000000-0000-0000-0000-000000000407', 'Emily Davis', 'Approved Borrow Request', 'BorrowRequest', '00000000-0000-0000-0000-000000000702', 'Dell Latitude 5540', 'Approved short-term HR laptop request.', 'COR-1002', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000001403', '00000000-0000-0000-0000-000000000406', 'Lisa Brown', 'Logged Discrepancy', 'Discrepancy', '00000000-0000-0000-0000-000000001001', 'Dell PowerEdge R750', 'Location mismatch recorded during Q2 verification.', 'COR-1003', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('00000000-0000-0000-0000-000000001404', '00000000-0000-0000-0000-000000000405', 'Alex Johnson', 'Updated Maintenance', 'Maintenance', '00000000-0000-0000-0000-000000001101', 'HP LaserJet Pro', 'Repair moved to in-progress after part delivery.', 'COR-1004', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
    ('00000000-0000-0000-0000-000000001405', '00000000-0000-0000-0000-000000000401', 'Sarah Chen', 'Reviewed Disposal', 'Disposal', '00000000-0000-0000-0000-000000001202', 'LG 34WN80C-B', 'Completed disposal approval and recycling handoff.', 'COR-1005', CURRENT_TIMESTAMP - INTERVAL '12 days');
