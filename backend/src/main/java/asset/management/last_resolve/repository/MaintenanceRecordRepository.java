package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.enums.MaintenanceStatus;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, UUID>, JpaSpecificationExecutor<MaintenanceRecord> {

    boolean existsByAsset_IdAndStatusIn(UUID assetId, Collection<MaintenanceStatus> statuses);
}
