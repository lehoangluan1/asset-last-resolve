package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Assignment;
import asset.management.last_resolve.enums.AssignmentType;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.TransferStatus;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.AssignmentRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssetRepository assetRepository;
    private final AppUserRepository appUserRepository;
    private final WorkflowMapper workflowMapper;
    private final PageResponseFactory pageResponseFactory;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<WorkflowDtos.AssignmentResponse> list(String search, String type, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<WorkflowDtos.AssignmentResponse> items = assignmentRepository.findAll().stream()
            .filter(assignment -> authorizationService.canViewAssignment(currentUser, assignment))
            .filter(assignment -> normalizedSearch.isBlank()
                || assignment.getAsset().getName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || assignment.getAsset().getCode().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .filter(assignment -> type == null || type.isBlank() || type.equalsIgnoreCase("all")
                || assignment.getAssignmentType().getValue().equalsIgnoreCase(type))
            .sorted(Comparator.comparing(Assignment::getEffectiveDate).reversed())
            .map(workflowMapper::toAssignmentResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }

    @Transactional
    public WorkflowDtos.AssignmentResponse create(WorkflowDtos.AssignmentCreateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageAssignments(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to create assignments");
        }

        Asset asset = assetRepository.findById(UUID.fromString(request.assetId()))
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        AppUser targetUser = appUserRepository.findById(UUID.fromString(request.toUserId()))
            .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

        if (asset.getLifecycleStatus() == LifecycleStatus.BORROWED
            || asset.getLifecycleStatus() == LifecycleStatus.UNDER_MAINTENANCE
            || asset.getLifecycleStatus() == LifecycleStatus.PENDING_DISPOSAL
            || asset.getLifecycleStatus() == LifecycleStatus.DISPOSED) {
            throw new BadRequestException("This asset is not available for assignment");
        }
        if (asset.getAssignedToUser() != null && asset.getAssignedToUser().getId().equals(targetUser.getId())) {
            throw new BadRequestException("This asset is already assigned to the selected user");
        }

        java.time.LocalDate effectiveDate = java.time.LocalDate.parse(request.effectiveDate());
        java.time.LocalDate returnDate = request.returnDate() == null || request.returnDate().isBlank()
            ? null
            : java.time.LocalDate.parse(request.returnDate());
        if (returnDate != null && returnDate.isBefore(effectiveDate)) {
            throw new BadRequestException("Return date must be on or after the effective date");
        }

        Assignment assignment = new Assignment();
        assignment.setAsset(asset);
        assignment.setAssignmentType(AssignmentType.fromValue(request.type()));
        assignment.setFromUser(asset.getAssignedToUser());
        assignment.setFromDepartment(asset.getDepartment());
        assignment.setToUser(targetUser);
        assignment.setToDepartment(targetUser.getDepartment());
        assignment.setStatus(TransferStatus.COMPLETED);
        assignment.setEffectiveDate(effectiveDate);
        assignment.setReturnDate(returnDate);
        assignment.setNotes(request.notes());
        assignment.setCreatedBy(currentUser);

        asset.setAssignedToUser(targetUser);
        asset.setDepartment(targetUser.getDepartment());
        asset.setLifecycleStatus(LifecycleStatus.IN_USE);

        Assignment saved = assignmentRepository.save(assignment);
        auditService.log(currentUser, "Created Assignment", "Assignment", saved.getId().toString(), saved.getAsset().getName(), "Assigned asset to " + targetUser.getFullName());
        return workflowMapper.toAssignmentResponse(saved);
    }
}
