package asset.management.last_resolve.mapper;

import asset.management.last_resolve.dto.NotificationDtos;
import asset.management.last_resolve.entity.AppNotification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDtos.NotificationResponse toResponse(AppNotification notification) {
        return new NotificationDtos.NotificationResponse(
            MapperUtils.uuid(notification.getId()),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType().getValue(),
            notification.getEntityType(),
            notification.getEntityId(),
            MapperUtils.timestamp(notification.getCreatedAt()),
            notification.isRead(),
            notification.getActorName(),
            notification.getPriority()
        );
    }
}
