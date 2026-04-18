package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.enums.BorrowStatus;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, UUID>, JpaSpecificationExecutor<BorrowRequest> {

    boolean existsByAsset_IdAndStatusIn(UUID assetId, Collection<BorrowStatus> statuses);

    boolean existsByAsset_IdAndStatusInAndIdNot(UUID assetId, Collection<BorrowStatus> statuses, UUID id);
}
