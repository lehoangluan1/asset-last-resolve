package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.VerificationTask;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface VerificationTaskRepository extends JpaRepository<VerificationTask, UUID>, JpaSpecificationExecutor<VerificationTask> {
    List<VerificationTask> findByCampaign_IdOrderByCreatedAtDesc(UUID campaignId);
}
