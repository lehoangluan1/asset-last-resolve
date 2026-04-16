package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.Department;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByCodeIgnoreCase(String code);
}
