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
}
