package asset.management.last_resolve.dto;

public final class NotificationDtos {

    private NotificationDtos() {
    }

    public record NotificationResponse(
        String id,
        String title,
        String message,
        String type,
        String entityType,
        String entityId,
        String timestamp,
        boolean read,
        String actor,
        String priority
    ) {
    }
}
