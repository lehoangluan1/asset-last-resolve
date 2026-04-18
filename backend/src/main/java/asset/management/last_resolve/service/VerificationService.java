package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.entity.VerificationTask;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.VerificationResult;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.repository.VerificationCampaignRepository;
import asset.management.last_resolve.repository.VerificationTaskRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private static final Set<VerificationResult> DISCREPANCY_RESULTS = Set.of(
        VerificationResult.DISCREPANCY,
        VerificationResult.MISSING,
        VerificationResult.DAMAGED
    );

    private final VerificationCampaignRepository verificationCampaignRepository;
    private final VerificationTaskRepository verificationTaskRepository;
    private final DepartmentRepository departmentRepository;
    private final AssetRepository assetRepository;
    private final WorkflowMapper workflowMapper;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<WorkflowDtos.VerificationCampaignResponse> listCampaigns() {
        AppUser currentUser = currentUserService.currentUser();
        return verificationCampaignRepository.findAll().stream()
            .filter(campaign -> authorizationService.canViewVerificationCampaign(currentUser, campaign))
            .sorted(Comparator.comparing(VerificationCampaign::getStartDate).reversed())
            .map(campaign -> workflowMapper.toCampaignResponse(campaign, verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(campaign.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public WorkflowDtos.VerificationCampaignResponse getCampaign(UUID campaignId) {
        AppUser currentUser = currentUserService.currentUser();
        VerificationCampaign campaign = verificationCampaignRepository.findById(campaignId)
            .orElseThrow(() -> new ResourceNotFoundException("Verification campaign not found"));
        if (!authorizationService.canViewVerificationCampaign(currentUser, campaign)) {
            throw new ForbiddenOperationException("You do not have access to this verification campaign");
        }
        return workflowMapper.toCampaignResponse(campaign, verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(campaignId));
    }

    @Transactional
    public WorkflowDtos.VerificationCampaignResponse createCampaign(WorkflowDtos.VerificationCampaignCreateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageVerification(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to create verification campaigns");
        }
        verificationCampaignRepository.findByCodeIgnoreCase(request.code()).ifPresent(existing -> {
            throw new BadRequestException("Verification campaign code already exists");
        });
        java.time.LocalDate startDate = java.time.LocalDate.parse(request.startDate());
        java.time.LocalDate dueDate = java.time.LocalDate.parse(request.dueDate());
        if (dueDate.isBefore(startDate)) {
            throw new BadRequestException("Campaign due date must be on or after the start date");
        }
        VerificationCampaign campaign = new VerificationCampaign();
        campaign.setCode(request.code().trim().toUpperCase());
        campaign.setName(request.name().trim());
        campaign.setYear(request.year());
        campaign.setDescription(request.description());
        campaign.setStatus(CampaignStatus.fromValue(request.status()));
        campaign.setStartDate(startDate);
        campaign.setDueDate(dueDate);
        campaign.setCreatedBy(currentUser);
        Set<asset.management.last_resolve.entity.Department> departments = request.departmentIds().stream()
            .map(UUID::fromString)
            .map(id -> departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found")))
            .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
        campaign.setDepartments(departments);
        campaign.setScope(
            departments.size() == departmentRepository.count()
                ? "All Departments"
                : departments.stream().map(asset.management.last_resolve.entity.Department::getCode).sorted().reduce((left, right) -> left + ", " + right).orElse("")
        );
        VerificationCampaign saved = verificationCampaignRepository.save(campaign);

        List<Asset> assets = assetRepository.findAll().stream()
            .filter(asset -> departments.stream().anyMatch(department -> department.getId().equals(asset.getDepartment().getId())))
            .toList();
        List<VerificationTask> tasks = assets.stream()
            .map(asset -> {
                VerificationTask task = new VerificationTask();
                task.setCampaign(saved);
                task.setAsset(asset);
                task.setAssignedToUser(currentUser);
                task.setExpectedLocation(asset.getLocation());
                task.setExpectedCondition(asset.getCondition());
                task.setExpectedAssignee(asset.getAssignedToUser());
                task.setResult(VerificationResult.PENDING);
                task.setNotes("Pending verification");
                return task;
            })
            .toList();
        verificationTaskRepository.saveAll(tasks);
        auditService.log(currentUser, "Created Verification Campaign", "Campaign", saved.getId().toString(), saved.getName(), "Created verification campaign");
        return workflowMapper.toCampaignResponse(saved, verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(saved.getId()));
    }

    @Transactional
    public WorkflowDtos.VerificationCampaignResponse updateCampaignStatus(UUID campaignId, WorkflowDtos.VerificationCampaignStatusUpdateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        VerificationCampaign campaign = verificationCampaignRepository.findById(campaignId)
            .orElseThrow(() -> new ResourceNotFoundException("Verification campaign not found"));
        if (!authorizationService.canManageVerification(currentUser) || !authorizationService.canViewVerificationCampaign(currentUser, campaign)) {
            throw new ForbiddenOperationException("You do not have permission to update this verification campaign");
        }

        CampaignStatus targetStatus = CampaignStatus.fromValue(request.status());
        validateCampaignStatusTransition(campaign.getStatus(), targetStatus);
        campaign.setStatus(targetStatus);
        VerificationCampaign saved = verificationCampaignRepository.save(campaign);
        auditService.log(
            currentUser,
            "Updated Verification Campaign",
            "Campaign",
            saved.getId().toString(),
            saved.getName(),
            "Changed verification campaign status to " + targetStatus.getValue()
        );
        return workflowMapper.toCampaignResponse(saved, verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(saved.getId()));
    }

    @Transactional
    public WorkflowDtos.VerificationCampaignResponse updateTask(UUID campaignId, UUID taskId, WorkflowDtos.VerificationTaskUpdateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        VerificationCampaign campaign = verificationCampaignRepository.findById(campaignId)
            .orElseThrow(() -> new ResourceNotFoundException("Verification campaign not found"));
        if (!authorizationService.canManageVerification(currentUser) || !authorizationService.canViewVerificationCampaign(currentUser, campaign)) {
            throw new ForbiddenOperationException("You do not have permission to update verification items");
        }
        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new BadRequestException("Verification items can only be updated while the campaign is active");
        }

        VerificationTask task = verificationTaskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Verification task not found"));
        if (!task.getCampaign().getId().equals(campaign.getId())) {
            throw new ResourceNotFoundException("Verification task not found for this campaign");
        }

        VerificationResult targetResult = VerificationResult.fromValue(request.result());
        if (targetResult == VerificationResult.PENDING) {
            throw new BadRequestException("Verification item status must be updated to a reviewed result");
        }

        task.setResult(targetResult);
        task.setNotes(request.notes() == null || request.notes().isBlank() ? defaultNotesFor(targetResult) : request.notes().trim());
        task.setVerifiedAt(OffsetDateTime.now());
        task.setVerifiedBy(currentUser);

        if (targetResult == VerificationResult.MATCHED) {
            task.setObservedLocation(task.getExpectedLocation());
            task.setObservedCondition(task.getExpectedCondition());
            task.setObservedAssignee(task.getExpectedAssignee());
        }

        task.getAsset().setLastVerifiedDate(LocalDate.now());
        verificationTaskRepository.save(task);

        if (DISCREPANCY_RESULTS.contains(targetResult)) {
            auditService.log(
                currentUser,
                "Flagged Verification Result",
                "VerificationTask",
                task.getId().toString(),
                task.getAsset().getName(),
                "Marked verification item as " + targetResult.getValue()
            );
        } else {
            auditService.log(
                currentUser,
                "Updated Verification Result",
                "VerificationTask",
                task.getId().toString(),
                task.getAsset().getName(),
                "Marked verification item as " + targetResult.getValue()
            );
        }

        return workflowMapper.toCampaignResponse(campaign, verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(campaign.getId()));
    }

    private void validateCampaignStatusTransition(CampaignStatus currentStatus, CampaignStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return;
        }
        if (currentStatus == CampaignStatus.DRAFT
            && (targetStatus == CampaignStatus.ACTIVE || targetStatus == CampaignStatus.CANCELLED)) {
            return;
        }
        if (currentStatus == CampaignStatus.ACTIVE
            && (targetStatus == CampaignStatus.COMPLETED || targetStatus == CampaignStatus.CANCELLED)) {
            return;
        }
        throw new BadRequestException("Invalid verification campaign status transition");
    }

    private String defaultNotesFor(VerificationResult result) {
        return switch (result) {
            case MATCHED -> "Asset verified";
            case DISCREPANCY -> "Verification discrepancy recorded";
            case MISSING -> "Asset not found during verification";
            case DAMAGED -> "Asset damage observed during verification";
            case SKIPPED -> "Verification skipped";
            case PENDING -> "Pending verification";
        };
    }
}
