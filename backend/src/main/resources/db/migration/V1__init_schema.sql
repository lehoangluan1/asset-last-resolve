CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    manager_user_id UUID,
    employee_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    building VARCHAR(120) NOT NULL,
    floor VARCHAR(20) NOT NULL,
    room VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE asset_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    parent_id UUID,
    borrowable_by_default BOOLEAN NOT NULL DEFAULT FALSE,
    requires_serial BOOLEAN NOT NULL DEFAULT TRUE,
    requires_verification BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset_categories_parent
        FOREIGN KEY (parent_id) REFERENCES asset_categories (id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    department_id UUID NOT NULL,
    phone VARCHAR(40),
    bio TEXT,
    avatar_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments (id)
);

ALTER TABLE departments
    ADD CONSTRAINT fk_departments_manager
    FOREIGN KEY (manager_user_id) REFERENCES users (id);

CREATE TABLE assets (
    id UUID PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL,
    department_id UUID NOT NULL,
    assigned_to_user_id UUID,
    location_id UUID NOT NULL,
    condition VARCHAR(30) NOT NULL,
    lifecycle_status VARCHAR(40) NOT NULL,
    brand VARCHAR(120),
    model VARCHAR(120),
    serial_number VARCHAR(120),
    purchase_date DATE,
    purchase_price NUMERIC(12, 2),
    warranty_expiry DATE,
    borrowable BOOLEAN NOT NULL DEFAULT FALSE,
    last_verified_date DATE,
    next_verification_due DATE,
    notes TEXT,
    created_by_id UUID,
    updated_by_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_assets_serial_number UNIQUE (serial_number),
    CONSTRAINT fk_assets_category
        FOREIGN KEY (category_id) REFERENCES asset_categories (id),
    CONSTRAINT fk_assets_department
        FOREIGN KEY (department_id) REFERENCES departments (id),
    CONSTRAINT fk_assets_assigned_user
        FOREIGN KEY (assigned_to_user_id) REFERENCES users (id),
    CONSTRAINT fk_assets_location
        FOREIGN KEY (location_id) REFERENCES locations (id),
    CONSTRAINT fk_assets_created_by
        FOREIGN KEY (created_by_id) REFERENCES users (id),
    CONSTRAINT fk_assets_updated_by
        FOREIGN KEY (updated_by_id) REFERENCES users (id)
);

CREATE TABLE assignments (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL,
    assignment_type VARCHAR(30) NOT NULL,
    from_user_id UUID,
    from_department_id UUID,
    to_user_id UUID NOT NULL,
    to_department_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    effective_date DATE NOT NULL,
    return_date DATE,
    notes TEXT,
    created_by_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_asset
        FOREIGN KEY (asset_id) REFERENCES assets (id),
    CONSTRAINT fk_assignments_from_user
        FOREIGN KEY (from_user_id) REFERENCES users (id),
    CONSTRAINT fk_assignments_from_department
        FOREIGN KEY (from_department_id) REFERENCES departments (id),
    CONSTRAINT fk_assignments_to_user
        FOREIGN KEY (to_user_id) REFERENCES users (id),
    CONSTRAINT fk_assignments_to_department
        FOREIGN KEY (to_department_id) REFERENCES departments (id),
    CONSTRAINT fk_assignments_created_by
        FOREIGN KEY (created_by_id) REFERENCES users (id)
);

CREATE TABLE borrow_requests (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL,
    requester_id UUID NOT NULL,
    department_id UUID NOT NULL,
    borrow_date DATE NOT NULL,
    return_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(40) NOT NULL,
    approved_by_id UUID,
    approver_notes TEXT,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    returned_at TIMESTAMP WITH TIME ZONE,
    decision_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_borrow_requests_asset
        FOREIGN KEY (asset_id) REFERENCES assets (id),
    CONSTRAINT fk_borrow_requests_requester
        FOREIGN KEY (requester_id) REFERENCES users (id),
    CONSTRAINT fk_borrow_requests_department
        FOREIGN KEY (department_id) REFERENCES departments (id),
    CONSTRAINT fk_borrow_requests_approved_by
        FOREIGN KEY (approved_by_id) REFERENCES users (id)
);

CREATE TABLE verification_campaigns (
    id UUID PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    year INTEGER NOT NULL,
    scope VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL,
    due_date DATE NOT NULL,
    start_date DATE NOT NULL,
    created_by_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_campaigns_created_by
        FOREIGN KEY (created_by_id) REFERENCES users (id)
);

CREATE TABLE verification_campaign_departments (
    campaign_id UUID NOT NULL,
    department_id UUID NOT NULL,
    PRIMARY KEY (campaign_id, department_id),
    CONSTRAINT fk_verification_campaign_departments_campaign
        FOREIGN KEY (campaign_id) REFERENCES verification_campaigns (id),
    CONSTRAINT fk_verification_campaign_departments_department
        FOREIGN KEY (department_id) REFERENCES departments (id)
);

CREATE TABLE verification_tasks (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    assigned_to_user_id UUID NOT NULL,
    expected_location_id UUID NOT NULL,
    expected_condition VARCHAR(30) NOT NULL,
    expected_assignee_id UUID,
    observed_location_id UUID,
    observed_condition VARCHAR(30),
    observed_assignee_id UUID,
    result VARCHAR(30) NOT NULL,
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_tasks_campaign
        FOREIGN KEY (campaign_id) REFERENCES verification_campaigns (id),
    CONSTRAINT fk_verification_tasks_asset
        FOREIGN KEY (asset_id) REFERENCES assets (id),
    CONSTRAINT fk_verification_tasks_assigned_to
        FOREIGN KEY (assigned_to_user_id) REFERENCES users (id),
    CONSTRAINT fk_verification_tasks_expected_location
        FOREIGN KEY (expected_location_id) REFERENCES locations (id),
    CONSTRAINT fk_verification_tasks_expected_assignee
        FOREIGN KEY (expected_assignee_id) REFERENCES users (id),
    CONSTRAINT fk_verification_tasks_observed_location
        FOREIGN KEY (observed_location_id) REFERENCES locations (id),
    CONSTRAINT fk_verification_tasks_observed_assignee
        FOREIGN KEY (observed_assignee_id) REFERENCES users (id),
    CONSTRAINT fk_verification_tasks_verified_by
        FOREIGN KEY (verified_by_id) REFERENCES users (id)
);

CREATE TABLE discrepancies (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL,
    task_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    type VARCHAR(30) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    expected_value TEXT NOT NULL,
    observed_value TEXT NOT NULL,
    root_cause TEXT,
    resolution TEXT,
    resolved_by_id UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_discrepancies_campaign
        FOREIGN KEY (campaign_id) REFERENCES verification_campaigns (id),
    CONSTRAINT fk_discrepancies_task
        FOREIGN KEY (task_id) REFERENCES verification_tasks (id),
    CONSTRAINT fk_discrepancies_asset
        FOREIGN KEY (asset_id) REFERENCES assets (id),
    CONSTRAINT fk_discrepancies_resolved_by
        FOREIGN KEY (resolved_by_id) REFERENCES users (id),
    CONSTRAINT fk_discrepancies_created_by
        FOREIGN KEY (created_by_id) REFERENCES users (id)
);

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL,
    maintenance_type VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    tech_condition VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    priority VARCHAR(30) NOT NULL,
    assigned_to_user_id UUID NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_records_asset
        FOREIGN KEY (asset_id) REFERENCES assets (id),
    CONSTRAINT fk_maintenance_records_assigned_to
        FOREIGN KEY (assigned_to_user_id) REFERENCES users (id),
    CONSTRAINT fk_maintenance_records_created_by
        FOREIGN KEY (created_by_id) REFERENCES users (id)
);

CREATE TABLE disposal_requests (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    proposed_by_id UUID NOT NULL,
    reviewed_by_id UUID,
    effective_date DATE,
    estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_disposal_requests_asset
        FOREIGN KEY (asset_id) REFERENCES assets (id),
    CONSTRAINT fk_disposal_requests_proposed_by
        FOREIGN KEY (proposed_by_id) REFERENCES users (id),
    CONSTRAINT fk_disposal_requests_reviewed_by
        FOREIGN KEY (reviewed_by_id) REFERENCES users (id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_user_id UUID NOT NULL,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(40) NOT NULL,
    entity_type VARCHAR(60),
    entity_id VARCHAR(64),
    actor_name VARCHAR(120),
    priority VARCHAR(20),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_user_id) REFERENCES users (id)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor_user_id UUID,
    actor_name VARCHAR(120) NOT NULL,
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(60) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    entity_name VARCHAR(180) NOT NULL,
    details TEXT NOT NULL,
    correlation_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_user_id) REFERENCES users (id)
);

CREATE INDEX idx_users_department ON users (department_id);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_assets_department ON assets (department_id);
CREATE INDEX idx_assets_assigned_to_user ON assets (assigned_to_user_id);
CREATE INDEX idx_assets_lifecycle_status ON assets (lifecycle_status);
CREATE INDEX idx_assignments_asset ON assignments (asset_id);
CREATE INDEX idx_assignments_to_user ON assignments (to_user_id);
CREATE INDEX idx_borrow_requests_requester ON borrow_requests (requester_id);
CREATE INDEX idx_borrow_requests_status ON borrow_requests (status);
CREATE INDEX idx_verification_tasks_campaign ON verification_tasks (campaign_id);
CREATE INDEX idx_verification_tasks_assigned_to_user ON verification_tasks (assigned_to_user_id);
CREATE INDEX idx_discrepancies_asset ON discrepancies (asset_id);
CREATE INDEX idx_discrepancies_status ON discrepancies (status);
CREATE INDEX idx_maintenance_records_asset ON maintenance_records (asset_id);
CREATE INDEX idx_maintenance_records_assigned_to_user ON maintenance_records (assigned_to_user_id);
CREATE INDEX idx_disposal_requests_asset ON disposal_requests (asset_id);
CREATE INDEX idx_notifications_recipient ON notifications (recipient_user_id, is_read);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
