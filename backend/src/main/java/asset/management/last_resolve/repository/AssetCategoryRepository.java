package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.AssetCategory;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, UUID> {
    Optional<AssetCategory> findByCodeIgnoreCase(String code);
}
