package asset.management.last_resolve.service;

import asset.management.last_resolve.entity.AppNotification;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.enums.NotificationType;
import asset.management.last_resolve.mapper.NotificationMapper;
import asset.management.last_resolve.repository.AppNotificationRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final AppNotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public List<asset.management.last_resolve.dto.NotificationDtos.NotificationResponse> getNotifications(AppUser user) {
        return notificationRepository.findByRecipientUser_IdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(notificationMapper::toResponse)
            .toList();
    }

    public void markAllRead(AppUser user) {
        List<AppNotification> notifications = notificationRepository.findByRecipientUser_IdOrderByCreatedAtDesc(user.getId());
        notifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(OffsetDateTime.now());
        });
        notificationRepository.saveAll(notifications);
    }

    public void markRead(AppUser user, UUID notificationId) {
        notificationRepository.findById(notificationId)
            .filter(notification -> notification.getRecipientUser().getId().equals(user.getId()))
            .ifPresent(notification -> {
                notification.setRead(true);
                notification.setReadAt(OffsetDateTime.now());
                notificationRepository.save(notification);
            });
    }

    public void create(AppUser recipient, String title, String message, NotificationType type, String entityType, String entityId, String actorName, String priority) {
        AppNotification notification = new AppNotification();
        notification.setRecipientUser(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setActorName(actorName);
        notification.setPriority(priority);
        notification.setRead(false);
        notificationRepository.save(notification);
    }
}
