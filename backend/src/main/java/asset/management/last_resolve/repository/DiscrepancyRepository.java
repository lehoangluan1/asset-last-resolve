package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.Discrepancy;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DiscrepancyRepository extends JpaRepository<Discrepancy, UUID>, JpaSpecificationExecutor<Discrepancy> {
}
