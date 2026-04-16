package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.DisposalRequest;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DisposalRequestRepository extends JpaRepository<DisposalRequest, UUID>, JpaSpecificationExecutor<DisposalRequest> {
}
