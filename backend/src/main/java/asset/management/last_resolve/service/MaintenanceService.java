package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.NotificationType;
import asset.management.last_resolve.enums.Priority;
import asset.management.last_resolve.enums.TechCondition;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final AssetRepository assetRepository;
    private final AppUserRepository appUserRepository;
    private final WorkflowMapper workflowMapper;
    private final PageResponseFactory pageResponseFactory;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<WorkflowDtos.MaintenanceRecordResponse> list(String search, String status, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<WorkflowDtos.MaintenanceRecordResponse> items = maintenanceRecordRepository.findAll().stream()
            .filter(record -> authorizationService.canViewMaintenance(currentUser, record))
            .filter(record -> normalizedSearch.isBlank()
                || record.getAsset().getName().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .filter(record -> status == null || status.isBlank() || status.equalsIgnoreCase("all")
                || record.getStatus().getValue().equalsIgnoreCase(status))
            .sorted(Comparator.comparing(MaintenanceRecord::getCreatedAt).reversed())
            .map(workflowMapper::toMaintenanceResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }

    @Transactional
    public WorkflowDtos.MaintenanceRecordResponse create(WorkflowDtos.MaintenanceCreateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageMaintenance(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to create maintenance records");
        }
        Asset asset = assetRepository.findById(UUID.fromString(request.assetId()))
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        AppUser technician = appUserRepository.findById(UUID.fromString(request.assignedToUserId()))
            .orElseThrow(() -> new ResourceNotFoundException("Assigned technician not found"));
        if (!authorizationService.isOneOf(technician, UserRole.TECHNICIAN, UserRole.OFFICER)) {
            throw new BadRequestException("Assigned user must be a technician or officer");
        }
        java.time.LocalDate scheduledDate = java.time.LocalDate.parse(request.scheduledDate());
        java.time.LocalDate completedDate = request.completedDate() == null || request.completedDate().isBlank()
            ? null
            : java.time.LocalDate.parse(request.completedDate());
        MaintenanceStatus status = MaintenanceStatus.fromValue(request.status());
        if (completedDate != null && completedDate.isBefore(scheduledDate)) {
            throw new BadRequestException("Completed date cannot be before the scheduled date");
        }
        if (status == MaintenanceStatus.COMPLETED && completedDate == null) {
            throw new BadRequestException("Completed maintenance records must include a completed date");
        }
        MaintenanceRecord record = new MaintenanceRecord();
        record.setAsset(asset);
        record.setMaintenanceType(request.type().trim());
        record.setDescription(request.description().trim());
        record.setTechCondition(TechCondition.fromValue(request.techCondition()));
        record.setStatus(status);
        record.setPriority(Priority.fromValue(request.priority()));
        record.setAssignedToUser(technician);
        record.setScheduledDate(scheduledDate);
        record.setCompletedDate(completedDate);
        record.setCost(request.cost() == null ? BigDecimal.ZERO : BigDecimal.valueOf(request.cost()));
        record.setNotes(request.notes());
        record.setCreatedBy(currentUser);
        if (status != MaintenanceStatus.COMPLETED) {
            asset.setLifecycleStatus(LifecycleStatus.UNDER_MAINTENANCE);
        }
        MaintenanceRecord saved = maintenanceRecordRepository.save(record);
        notificationService.create(
            technician,
            "Maintenance scheduled",
            "%s has been assigned to you.".formatted(saved.getAsset().getName()),
            NotificationType.GENERAL,
            "Maintenance",
            saved.getId().toString(),
            currentUser.getFullName(),
            "normal"
        );
        auditService.log(currentUser, "Created Maintenance", "Maintenance", saved.getId().toString(), saved.getAsset().getName(), "Created maintenance record");
        return workflowMapper.toMaintenanceResponse(saved);
    }
}
