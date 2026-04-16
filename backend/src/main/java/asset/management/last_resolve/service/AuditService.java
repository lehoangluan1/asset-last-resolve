package asset.management.last_resolve.service;

import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.AuditLog;
import asset.management.last_resolve.repository.AuditLogRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(AppUser actor, String action, String entityType, String entityId, String entityName, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActorUser(actor);
        auditLog.setActorName(actor.getFullName());
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setEntityName(entityName);
        auditLog.setDetails(details);
        auditLog.setCorrelationId("COR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        auditLogRepository.save(auditLog);
    }
}
