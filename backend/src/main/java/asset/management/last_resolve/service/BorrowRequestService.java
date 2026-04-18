package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.AssetCategory;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.BorrowTargetType;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.NotificationType;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssetCategoryRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
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
public class BorrowRequestService {

    private static final Set<BorrowStatus> ACTIVE_WORKFLOW_STATUSES = Set.of(
        BorrowStatus.PENDING_APPROVAL,
        BorrowStatus.APPROVED,
        BorrowStatus.CHECKED_OUT,
        BorrowStatus.OVERDUE
    );

    private final BorrowRequestRepository borrowRequestRepository;
    private final AssetRepository assetRepository;
    private final AssetCategoryRepository assetCategoryRepository;
    private final DepartmentRepository departmentRepository;
    private final WorkflowMapper workflowMapper;
    private final PageResponseFactory pageResponseFactory;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<WorkflowDtos.BorrowRequestResponse> list(String search, String status, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<WorkflowDtos.BorrowRequestResponse> items = borrowRequestRepository.findAll().stream()
            .filter(request -> authorizationService.canViewBorrowRequest(currentUser, request))
            .filter(request -> normalizedSearch.isBlank()
                || requestLabel(request).toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || request.getCategory().getName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || request.getRequester().getFullName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || request.getDepartment().getName().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .filter(request -> status == null || status.isBlank() || status.equalsIgnoreCase("all")
                || request.getStatus().getValue().equalsIgnoreCase(status))
            .sorted(Comparator.comparing(BorrowRequest::getCreatedAt).reversed())
            .map(workflowMapper::toBorrowRequestResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }

    @Transactional(readOnly = true)
    public WorkflowDtos.BorrowRequestResponse get(UUID requestId) {
        AppUser currentUser = currentUserService.currentUser();
        BorrowRequest request = borrowRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found"));
        if (!authorizationService.canViewBorrowRequest(currentUser, request)) {
            throw new ForbiddenOperationException("You do not have access to this borrow request");
        }
        return workflowMapper.toBorrowRequestResponse(request);
    }

    @Transactional
    public WorkflowDtos.BorrowRequestResponse create(WorkflowDtos.BorrowRequestCreateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canRequestBorrow(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to create borrow requests");
        }
        BorrowTargetType targetType = request.targetType() == null || request.targetType().isBlank()
            ? BorrowTargetType.INDIVIDUAL
            : BorrowTargetType.fromValue(request.targetType());
        Department department = resolveDepartment(currentUser, request.departmentId(), targetType);

        Asset asset = null;
        AssetCategory category;
        if (request.assetId() != null && !request.assetId().isBlank()) {
            asset = assetRepository.findById(UUID.fromString(request.assetId()))
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
            if (!authorizationService.canViewAsset(currentUser, asset)) {
                throw new ForbiddenOperationException("You do not have access to borrow this asset");
            }
            if (!asset.isBorrowable()) {
                throw new BadRequestException("This asset is not borrowable");
            }
            if (asset.getLifecycleStatus() != LifecycleStatus.IN_STORAGE && asset.getLifecycleStatus() != LifecycleStatus.IN_USE) {
                throw new BadRequestException("This asset is not currently available for borrowing");
            }
            boolean activeRequestExists = borrowRequestRepository.existsByAsset_IdAndStatusIn(asset.getId(), ACTIVE_WORKFLOW_STATUSES);
            if (activeRequestExists) {
                throw new BadRequestException("This asset already has an active borrow workflow");
            }
            category = asset.getCategory();
        } else {
            if (request.categoryId() == null || request.categoryId().isBlank()) {
                throw new BadRequestException("Category is required when no specific asset is selected");
            }
            category = assetCategoryRepository.findById(UUID.fromString(request.categoryId()))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        java.time.LocalDate borrowDate = java.time.LocalDate.parse(request.borrowDate());
        java.time.LocalDate returnDate = java.time.LocalDate.parse(request.returnDate());
        if (returnDate.isBefore(borrowDate)) {
            throw new BadRequestException("Return date must be on or after the borrow date");
        }
        BorrowRequest borrowRequest = new BorrowRequest();
        borrowRequest.setAsset(asset);
        borrowRequest.setCategory(category);
        borrowRequest.setRequester(currentUser);
        borrowRequest.setDepartment(department);
        borrowRequest.setTargetType(targetType);
        borrowRequest.setBorrowDate(borrowDate);
        borrowRequest.setReturnDate(returnDate);
        borrowRequest.setPurpose(request.purpose() == null || request.purpose().isBlank() ? "Request for " + category.getName() : request.purpose().trim());
        borrowRequest.setNotes(request.notes());
        borrowRequest.setStatus(BorrowStatus.PENDING_APPROVAL);
        BorrowRequest saved = borrowRequestRepository.save(borrowRequest);
        auditService.log(currentUser, "Created Borrow Request", "BorrowRequest", saved.getId().toString(), requestLabel(saved), "Submitted a borrow request");
        return workflowMapper.toBorrowRequestResponse(saved);
    }

    @Transactional
    public WorkflowDtos.BorrowRequestResponse approve(UUID requestId, WorkflowDtos.DecisionRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        BorrowRequest saved = decide(requestId, currentUser, BorrowStatus.APPROVED, request);
        String label = requestLabel(saved);
        notificationService.create(
            saved.getRequester(),
            "Borrow request approved",
            "Your request for %s was approved by %s.".formatted(label, currentUser.getFullName()),
            NotificationType.BORROW_APPROVED,
            "BorrowRequest",
            saved.getId().toString(),
            currentUser.getFullName(),
            "normal"
        );
        auditService.log(currentUser, "Approved Borrow Request", "BorrowRequest", saved.getId().toString(), label, "Approved borrow request");
        return workflowMapper.toBorrowRequestResponse(saved);
    }

    @Transactional
    public WorkflowDtos.BorrowRequestResponse reject(UUID requestId, WorkflowDtos.DecisionRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        BorrowRequest saved = decide(requestId, currentUser, BorrowStatus.REJECTED, request);
        String label = requestLabel(saved);
        notificationService.create(
            saved.getRequester(),
            "Borrow request rejected",
            "Your request for %s was rejected by %s.".formatted(label, currentUser.getFullName()),
            NotificationType.BORROW_REJECTED,
            "BorrowRequest",
            saved.getId().toString(),
            currentUser.getFullName(),
            "high"
        );
        auditService.log(currentUser, "Rejected Borrow Request", "BorrowRequest", saved.getId().toString(), label, "Rejected borrow request");
        return workflowMapper.toBorrowRequestResponse(saved);
    }

    private BorrowRequest decide(UUID requestId, AppUser currentUser, BorrowStatus targetStatus, WorkflowDtos.DecisionRequest request) {
        BorrowRequest borrowRequest = borrowRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found"));
        if (!authorizationService.canApproveBorrowRequest(currentUser, borrowRequest)) {
            throw new ForbiddenOperationException("You do not have permission to review this request");
        }
        if (borrowRequest.getStatus() != BorrowStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Only pending borrow requests can be reviewed");
        }
        borrowRequest.setStatus(targetStatus);
        borrowRequest.setApprovedBy(currentUser);
        borrowRequest.setApproverNotes(request.notes());
        borrowRequest.setDecisionAt(OffsetDateTime.now());
        return borrowRequestRepository.save(borrowRequest);
    }

    private Department resolveDepartment(AppUser currentUser, String requestedDepartmentId, BorrowTargetType targetType) {
        if (targetType == BorrowTargetType.DEPARTMENT) {
            if (currentUser.getRole() != UserRole.MANAGER) {
                throw new BadRequestException("Only managers can create department borrow requests");
            }
            if (requestedDepartmentId == null || requestedDepartmentId.isBlank()) {
                return currentUser.getDepartment();
            }
            Department department = departmentRepository.findById(UUID.fromString(requestedDepartmentId))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            if (!department.getId().equals(currentUser.getDepartment().getId())) {
                throw new ForbiddenOperationException("Managers can only create department requests for their own department");
            }
            return department;
        }
        return currentUser.getDepartment();
    }

    private String requestLabel(BorrowRequest request) {
        return request.getAsset() != null ? request.getAsset().getName() : request.getCategory().getName();
    }
}
