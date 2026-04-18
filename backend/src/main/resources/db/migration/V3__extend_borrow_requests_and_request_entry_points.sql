ALTER TABLE borrow_requests
    ADD COLUMN category_id UUID;

UPDATE borrow_requests AS request
SET category_id = asset.category_id
FROM assets AS asset
WHERE request.asset_id = asset.id;

ALTER TABLE borrow_requests
    ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE borrow_requests
    ADD CONSTRAINT fk_borrow_requests_category
    FOREIGN KEY (category_id) REFERENCES asset_categories (id);

ALTER TABLE borrow_requests
    ALTER COLUMN asset_id DROP NOT NULL;

ALTER TABLE borrow_requests
    ADD COLUMN target_type VARCHAR(30) NOT NULL DEFAULT 'INDIVIDUAL';

CREATE INDEX idx_borrow_requests_category ON borrow_requests (category_id);
CREATE INDEX idx_borrow_requests_target_type ON borrow_requests (target_type);
