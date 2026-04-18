package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.DiscrepancyType;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DiscrepancyRepository extends JpaRepository<Discrepancy, UUID>, JpaSpecificationExecutor<Discrepancy> {

    boolean existsByAsset_IdAndTask_IdAndTypeAndStatusIn(UUID assetId, UUID taskId, DiscrepancyType type, Collection<DiscrepancyStatus> statuses);
}
