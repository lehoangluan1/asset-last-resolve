package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.DisposalRequest;
import asset.management.last_resolve.enums.DisposalStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.DisposalRequestRepository;
import java.time.LocalDate;
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
public class DisposalService {

    private static final Set<DisposalStatus> ACTIVE_DISPOSAL_STATUSES = Set.of(
        DisposalStatus.PROPOSED,
        DisposalStatus.UNDER_REVIEW,
        DisposalStatus.APPROVED,
        DisposalStatus.DEFERRED
    );

    private final DisposalRequestRepository disposalRequestRepository;
    private final AssetRepository assetRepository;
    private final WorkflowMapper workflowMapper;
    private final PageResponseFactory pageResponseFactory;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<WorkflowDtos.DisposalRequestResponse> list(String search, String status, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<WorkflowDtos.DisposalRequestResponse> items = disposalRequestRepository.findAll().stream()
            .filter(request -> authorizationService.canViewDisposal(currentUser, request))
            .filter(request -> normalizedSearch.isBlank()
                || request.getAsset().getName().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .filter(request -> status == null || status.isBlank() || status.equalsIgnoreCase("all")
                || request.getStatus().getValue().equalsIgnoreCase(status))
            .sorted(Comparator.comparing(DisposalRequest::getCreatedAt).reversed())
            .map(workflowMapper::toDisposalResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }

    @Transactional
    public WorkflowDtos.DisposalRequestResponse create(WorkflowDtos.DisposalCreateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageDisposal(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to create disposal requests");
        }

        Asset asset = assetRepository.findById(UUID.fromString(request.assetId()))
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        if (!authorizationService.canViewAsset(currentUser, asset)) {
            throw new ForbiddenOperationException("You do not have access to this asset");
        }
        if (disposalRequestRepository.existsByAsset_IdAndStatusIn(asset.getId(), ACTIVE_DISPOSAL_STATUSES)) {
            throw new BadRequestException("This asset already has an active disposal workflow");
        }

        DisposalRequest disposalRequest = new DisposalRequest();
        disposalRequest.setAsset(asset);
        disposalRequest.setReason(request.reason().trim());
        disposalRequest.setStatus(DisposalStatus.PROPOSED);
        disposalRequest.setProposedBy(currentUser);
        disposalRequest.setEstimatedValue(java.math.BigDecimal.valueOf(request.estimatedValue() == null ? 0D : request.estimatedValue()));
        disposalRequest.setNotes(request.notes());
        asset.setLifecycleStatus(LifecycleStatus.PENDING_DISPOSAL);

        DisposalRequest saved = disposalRequestRepository.save(disposalRequest);
        auditService.log(currentUser, "Created Disposal Request", "Disposal", saved.getId().toString(), saved.getAsset().getName(), "Submitted asset for disposal");
        return workflowMapper.toDisposalResponse(saved);
    }

    @Transactional
    public WorkflowDtos.DisposalRequestResponse approve(UUID disposalId, WorkflowDtos.DecisionRequest request) {
        return updateStatus(disposalId, DisposalStatus.APPROVED, request.notes(), true);
    }

    @Transactional
    public WorkflowDtos.DisposalRequestResponse reject(UUID disposalId, WorkflowDtos.DecisionRequest request) {
        return updateStatus(disposalId, DisposalStatus.REJECTED, request.notes(), false);
    }

    @Transactional
    public WorkflowDtos.DisposalRequestResponse defer(UUID disposalId, WorkflowDtos.DecisionRequest request) {
        return updateStatus(disposalId, DisposalStatus.DEFERRED, request.notes(), false);
    }

    private WorkflowDtos.DisposalRequestResponse updateStatus(UUID disposalId, DisposalStatus status, String notes, boolean setEffectiveDate) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageDisposal(currentUser)) {
            throw new ForbiddenOperationException("You do not have permission to manage disposal requests");
        }
        DisposalRequest request = disposalRequestRepository.findById(disposalId)
            .orElseThrow(() -> new ResourceNotFoundException("Disposal request not found"));
        if (!authorizationService.canViewDisposal(currentUser, request)) {
            throw new ForbiddenOperationException("You do not have access to this disposal request");
        }
        request.setStatus(status);
        request.setReviewedBy(currentUser);
        request.setNotes(notes == null || notes.isBlank() ? request.getNotes() : notes);
        if (setEffectiveDate) {
            request.setEffectiveDate(LocalDate.now());
        }
        if (status == DisposalStatus.APPROVED) {
            request.getAsset().setLifecycleStatus(LifecycleStatus.PENDING_DISPOSAL);
        }
        DisposalRequest saved = disposalRequestRepository.save(request);
        auditService.log(currentUser, "Updated Disposal Request", "Disposal", saved.getId().toString(), saved.getAsset().getName(), "Changed disposal status to " + status.getValue());
        return workflowMapper.toDisposalResponse(saved);
    }
}
