package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.entity.VerificationTask;
import asset.management.last_resolve.enums.DiscrepancySeverity;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.DiscrepancyType;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.Priority;
import asset.management.last_resolve.enums.TechCondition;
import asset.management.last_resolve.enums.VerificationResult;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.DiscrepancyRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import asset.management.last_resolve.repository.VerificationTaskRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DiscrepancyService {

    private final DiscrepancyRepository discrepancyRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final AppUserRepository appUserRepository;
    private final AssetRepository assetRepository;
    private final VerificationTaskRepository verificationTaskRepository;
    private final WorkflowMapper workflowMapper;
    private final PageResponseFactory pageResponseFactory;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<WorkflowDtos.DiscrepancyResponse> list(String search, String status, String severity, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<WorkflowDtos.DiscrepancyResponse> items = discrepancyRepository.findAll().stream()
            .filter(discrepancy -> authorizationService.canViewDiscrepancy(currentUser, discrepancy))
            .filter(discrepancy -> normalizedSearch.isBlank()
                || discrepancy.getAsset().getName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || discrepancy.getAsset().getCode().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .filter(discrepancy -> status == null || status.isBlank() || status.equalsIgnoreCase("all")
                || discrepancy.getStatus().getValue().equalsIgnoreCase(status))
            .filter(discrepancy -> severity == null || severity.isBlank() || severity.equalsIgnoreCase("all")
                || discrepancy.getSeverity().getValue().equalsIgnoreCase(severity))
            .sorted(Comparator.comparing(Discrepancy::getCreatedAt).reversed())
            .map(workflowMapper::toDiscrepancyResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }

    @Transactional(readOnly = true)
    public WorkflowDtos.DiscrepancyResponse get(UUID discrepancyId) {
        AppUser currentUser = currentUserService.currentUser();
        Discrepancy discrepancy = discrepancyRepository.findById(discrepancyId)
            .orElseThrow(() -> new ResourceNotFoundException("Discrepancy not found"));
        if (!authorizationService.canViewDiscrepancy(currentUser, discrepancy)) {
            throw new ForbiddenOperationException("You do not have access to this discrepancy");
        }
        return workflowMapper.toDiscrepancyResponse(discrepancy);
    }

    @Transactional
    public WorkflowDtos.DiscrepancyResponse create(WorkflowDtos.DiscrepancyCreateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageDiscrepancy(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to create discrepancies");
        }

        Asset asset = assetRepository.findById(UUID.fromString(request.assetId()))
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        VerificationTask task = request.verificationTaskId() == null || request.verificationTaskId().isBlank()
            ? verificationTaskRepository.findFirstByAsset_IdOrderByCreatedAtDesc(asset.getId())
                .orElseThrow(() -> new BadRequestException("This asset does not have a verification task to attach a discrepancy to"))
            : verificationTaskRepository.findById(UUID.fromString(request.verificationTaskId()))
                .orElseThrow(() -> new ResourceNotFoundException("Verification task not found"));
        if (!task.getAsset().getId().equals(asset.getId())) {
            throw new BadRequestException("Selected verification task does not belong to the chosen asset");
        }

        DiscrepancyType type = DiscrepancyType.fromValue(request.type());
        if (discrepancyRepository.existsByAsset_IdAndTask_IdAndTypeAndStatusIn(
            asset.getId(),
            task.getId(),
            type,
            Set.of(DiscrepancyStatus.OPEN, DiscrepancyStatus.INVESTIGATING, DiscrepancyStatus.ESCALATED)
        )) {
            throw new BadRequestException("An active discrepancy of this type already exists for the selected verification task");
        }

        Discrepancy discrepancy = new Discrepancy();
        discrepancy.setCampaign(task.getCampaign());
        discrepancy.setTask(task);
        discrepancy.setAsset(asset);
        discrepancy.setType(type);
        discrepancy.setSeverity(DiscrepancySeverity.fromValue(request.severity()));
        discrepancy.setStatus(DiscrepancyStatus.OPEN);
        discrepancy.setExpectedValue(request.expectedValue().trim());
        discrepancy.setObservedValue(request.observedValue().trim());
        discrepancy.setRootCause(request.rootCause());
        discrepancy.setResolution(request.notes());
        discrepancy.setCreatedBy(currentUser);

        task.setResult(VerificationResult.DISCREPANCY);
        if (task.getVerifiedAt() == null) {
            task.setVerifiedAt(OffsetDateTime.now());
            task.setVerifiedBy(currentUser);
        }
        verificationTaskRepository.save(task);

        Discrepancy saved = discrepancyRepository.save(discrepancy);
        auditService.log(currentUser, "Created Discrepancy", "Discrepancy", saved.getId().toString(), saved.getAsset().getName(), "Recorded discrepancy from manual review");
        return workflowMapper.toDiscrepancyResponse(saved);
    }

    @Transactional
    public WorkflowDtos.DiscrepancyResponse reconcile(UUID discrepancyId, WorkflowDtos.DiscrepancyActionRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageDiscrepancy(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to reconcile discrepancies");
        }
        Discrepancy discrepancy = discrepancyRepository.findById(discrepancyId)
            .orElseThrow(() -> new ResourceNotFoundException("Discrepancy not found"));
        if (discrepancy.getStatus() == DiscrepancyStatus.RESOLVED) {
            throw new BadRequestException("This discrepancy has already been resolved");
        }
        discrepancy.setStatus(DiscrepancyStatus.RESOLVED);
        discrepancy.setRootCause(request.rootCause());
        discrepancy.setResolution(request.resolution() == null || request.resolution().isBlank() ? "Resolved by reconciliation" : request.resolution());
        discrepancy.setResolvedBy(currentUser);
        discrepancy.setResolvedAt(OffsetDateTime.now());
        Discrepancy saved = discrepancyRepository.save(discrepancy);
        auditService.log(currentUser, "Resolved Discrepancy", "Discrepancy", saved.getId().toString(), saved.getAsset().getName(), "Resolved discrepancy");
        return workflowMapper.toDiscrepancyResponse(saved);
    }

    @Transactional
    public WorkflowDtos.DiscrepancyResponse escalate(UUID discrepancyId, WorkflowDtos.DiscrepancyActionRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageDiscrepancy(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to escalate discrepancies");
        }
        Discrepancy discrepancy = discrepancyRepository.findById(discrepancyId)
            .orElseThrow(() -> new ResourceNotFoundException("Discrepancy not found"));
        if (discrepancy.getStatus() == DiscrepancyStatus.RESOLVED) {
            throw new BadRequestException("Resolved discrepancies cannot be escalated");
        }
        discrepancy.setStatus(DiscrepancyStatus.ESCALATED);
        discrepancy.setRootCause(request.rootCause());
        discrepancy.setResolution(request.notes());
        Discrepancy saved = discrepancyRepository.save(discrepancy);
        auditService.log(currentUser, "Escalated Discrepancy", "Discrepancy", saved.getId().toString(), saved.getAsset().getName(), "Escalated discrepancy");
        return workflowMapper.toDiscrepancyResponse(saved);
    }

    @Transactional
    public WorkflowDtos.DiscrepancyResponse sendToMaintenance(UUID discrepancyId, WorkflowDtos.DiscrepancyActionRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageDiscrepancy(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to create maintenance from discrepancies");
        }
        Discrepancy discrepancy = discrepancyRepository.findById(discrepancyId)
            .orElseThrow(() -> new ResourceNotFoundException("Discrepancy not found"));
        if (discrepancy.getStatus() == DiscrepancyStatus.RESOLVED) {
            throw new BadRequestException("Resolved discrepancies cannot be sent to maintenance");
        }
        AppUser assignedTechnician = appUserRepository.findAll().stream()
            .filter(user -> user.getRole() == asset.management.last_resolve.enums.UserRole.TECHNICIAN)
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("No technician available"));
        MaintenanceRecord record = new MaintenanceRecord();
        record.setAsset(discrepancy.getAsset());
        record.setMaintenanceType("Inspection");
        record.setDescription(request.notes() == null || request.notes().isBlank() ? "Created from discrepancy review" : request.notes());
        record.setTechCondition(TechCondition.NEEDS_MONITORING);
        record.setStatus(MaintenanceStatus.SCHEDULED);
        record.setPriority(Priority.NORMAL);
        record.setAssignedToUser(assignedTechnician);
        record.setScheduledDate(java.time.LocalDate.now().plusDays(1));
        record.setCost(BigDecimal.ZERO);
        record.setNotes("Generated from discrepancy " + discrepancy.getId());
        record.setCreatedBy(currentUser);
        maintenanceRecordRepository.save(record);
        discrepancy.setStatus(DiscrepancyStatus.INVESTIGATING);
        discrepancy.setResolution("Sent to maintenance");
        Discrepancy saved = discrepancyRepository.save(discrepancy);
        auditService.log(currentUser, "Created Maintenance From Discrepancy", "Discrepancy", saved.getId().toString(), saved.getAsset().getName(), "Created linked maintenance record");
        return workflowMapper.toDiscrepancyResponse(saved);
    }
}
