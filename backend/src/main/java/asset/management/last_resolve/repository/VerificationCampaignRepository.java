package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.enums.CampaignStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationCampaignRepository extends JpaRepository<VerificationCampaign, UUID> {
    Optional<VerificationCampaign> findFirstByStatusOrderByStartDateDesc(CampaignStatus status);
    Optional<VerificationCampaign> findByCodeIgnoreCase(String code);
}
