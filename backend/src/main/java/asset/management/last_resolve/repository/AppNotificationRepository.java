package asset.management.last_resolve.repository;

import asset.management.last_resolve.entity.AppNotification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppNotificationRepository extends JpaRepository<AppNotification, UUID> {
    List<AppNotification> findByRecipientUser_IdOrderByCreatedAtDesc(UUID userId);

    long countByRecipientUser_IdAndReadFalse(UUID userId);
}
