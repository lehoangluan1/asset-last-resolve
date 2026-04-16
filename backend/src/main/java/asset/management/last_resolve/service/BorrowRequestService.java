package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.NotificationType;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
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
                || request.getAsset().getName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || request.getRequester().getFullName().toLowerCase(Locale.ROOT).contains(normalizedSearch))
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
        Asset asset = assetRepository.findById(UUID.fromString(request.assetId()))
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
        java.time.LocalDate borrowDate = java.time.LocalDate.parse(request.borrowDate());
        java.time.LocalDate returnDate = java.time.LocalDate.parse(request.returnDate());
        if (returnDate.isBefore(borrowDate)) {
            throw new BadRequestException("Return date must be on or after the borrow date");
        }
        boolean activeRequestExists = borrowRequestRepository.existsByAsset_IdAndStatusIn(asset.getId(), ACTIVE_WORKFLOW_STATUSES);
        if (activeRequestExists) {
            throw new BadRequestException("This asset already has an active borrow workflow");
        }
        BorrowRequest borrowRequest = new BorrowRequest();
        borrowRequest.setAsset(asset);
        borrowRequest.setRequester(currentUser);
        borrowRequest.setDepartment(currentUser.getDepartment());
        borrowRequest.setBorrowDate(borrowDate);
        borrowRequest.setReturnDate(returnDate);
        borrowRequest.setPurpose(request.purpose().trim());
        borrowRequest.setNotes(request.notes());
        borrowRequest.setStatus(BorrowStatus.PENDING_APPROVAL);
        BorrowRequest saved = borrowRequestRepository.save(borrowRequest);
        auditService.log(currentUser, "Created Borrow Request", "BorrowRequest", saved.getId().toString(), asset.getName(), "Submitted a borrow request");
        return workflowMapper.toBorrowRequestResponse(saved);
    }

    @Transactional
    public WorkflowDtos.BorrowRequestResponse approve(UUID requestId, WorkflowDtos.DecisionRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        BorrowRequest saved = decide(requestId, currentUser, BorrowStatus.APPROVED, request);
        notificationService.create(
            saved.getRequester(),
            "Borrow request approved",
            "Your request for %s was approved by %s.".formatted(saved.getAsset().getName(), currentUser.getFullName()),
            NotificationType.BORROW_APPROVED,
            "BorrowRequest",
            saved.getId().toString(),
            currentUser.getFullName(),
            "normal"
        );
        auditService.log(currentUser, "Approved Borrow Request", "BorrowRequest", saved.getId().toString(), saved.getAsset().getName(), "Approved borrow request");
        return workflowMapper.toBorrowRequestResponse(saved);
    }

    @Transactional
    public WorkflowDtos.BorrowRequestResponse reject(UUID requestId, WorkflowDtos.DecisionRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        BorrowRequest saved = decide(requestId, currentUser, BorrowStatus.REJECTED, request);
        notificationService.create(
            saved.getRequester(),
            "Borrow request rejected",
            "Your request for %s was rejected by %s.".formatted(saved.getAsset().getName(), currentUser.getFullName()),
            NotificationType.BORROW_REJECTED,
            "BorrowRequest",
            saved.getId().toString(),
            currentUser.getFullName(),
            "high"
        );
        auditService.log(currentUser, "Rejected Borrow Request", "BorrowRequest", saved.getId().toString(), saved.getAsset().getName(), "Rejected borrow request");
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
}
