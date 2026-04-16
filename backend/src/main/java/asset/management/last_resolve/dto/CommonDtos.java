package asset.management.last_resolve.dto;

import java.time.OffsetDateTime;
import java.util.List;

public final class CommonDtos {

    private CommonDtos() {
    }

    public record PageResponse<T>(
        List<T> items,
        long totalItems,
        int page,
        int size,
        int totalPages
    ) {
    }

    public record ApiErrorResponse(
        int status,
        String error,
        String message,
        String path,
        OffsetDateTime timestamp,
        List<FieldErrorResponse> fieldErrors
    ) {
    }

    public record FieldErrorResponse(
        String field,
        String message
    ) {
    }

    public record AuditLogResponse(
        String id,
        String actor,
        String action,
        String entityType,
        String entityId,
        String entityName,
        String timestamp,
        String details,
        String correlationId
    ) {
    }
}
