package asset.management.last_resolve.mapper;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class CommonMapper {

    public CommonDtos.AuditLogResponse toAuditLogResponse(AuditLog auditLog) {
        return new CommonDtos.AuditLogResponse(
            MapperUtils.uuid(auditLog.getId()),
            auditLog.getActorName(),
            auditLog.getAction(),
            auditLog.getEntityType(),
            auditLog.getEntityId(),
            auditLog.getEntityName(),
            MapperUtils.timestamp(auditLog.getCreatedAt()),
            auditLog.getDetails(),
            auditLog.getCorrelationId()
        );
    }
}
