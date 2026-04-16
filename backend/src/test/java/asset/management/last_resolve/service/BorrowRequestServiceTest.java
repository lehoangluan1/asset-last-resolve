package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BorrowRequestServiceTest {

    @Mock
    private BorrowRequestRepository borrowRequestRepository;
    @Mock
    private AssetRepository assetRepository;
    @Mock
    private WorkflowMapper workflowMapper;
    @Mock
    private PageResponseFactory pageResponseFactory;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private AuthorizationService authorizationService;
    @Mock
    private AuditService auditService;
    @Mock
    private NotificationService notificationService;

    private BorrowRequestService service;
    private AppUser requester;
    private Asset asset;

    @BeforeEach
    void setUp() {
        service = new BorrowRequestService(
            borrowRequestRepository,
            assetRepository,
            workflowMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService,
            auditService,
            notificationService
        );

        Department department = TestDataFactory.department("IT");
        requester = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        asset = TestDataFactory.asset(department, null, true, LifecycleStatus.IN_STORAGE);
    }

    @Test
    void createRejectsUsersWithoutBorrowPermission() {
        when(currentUserService.currentUser()).thenReturn(requester);
        when(authorizationService.canRequestBorrow(requester)).thenReturn(false);

        assertThatThrownBy(() -> service.create(request("2026-04-20", "2026-04-21")))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("create borrow requests");
    }

    @Test
    void createRejectsAssetsOutsideUserScope() {
        when(currentUserService.currentUser()).thenReturn(requester);
        when(authorizationService.canRequestBorrow(requester)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(authorizationService.canViewAsset(requester, asset)).thenReturn(false);

        assertThatThrownBy(() -> service.create(request("2026-04-20", "2026-04-21")))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("access to borrow this asset");
    }

    @Test
    void createRejectsNonBorrowableAssets() {
        asset.setBorrowable(false);
        when(currentUserService.currentUser()).thenReturn(requester);
        when(authorizationService.canRequestBorrow(requester)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(authorizationService.canViewAsset(requester, asset)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request("2026-04-20", "2026-04-21")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("not borrowable");
    }

    @Test
    void createRejectsAssetsUnavailableForBorrowing() {
        asset.setLifecycleStatus(LifecycleStatus.UNDER_MAINTENANCE);
        when(currentUserService.currentUser()).thenReturn(requester);
        when(authorizationService.canRequestBorrow(requester)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(authorizationService.canViewAsset(requester, asset)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request("2026-04-20", "2026-04-21")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("currently available");
    }

    @Test
    void createRejectsReturnDateBeforeBorrowDate() {
        when(currentUserService.currentUser()).thenReturn(requester);
        when(authorizationService.canRequestBorrow(requester)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(authorizationService.canViewAsset(requester, asset)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request("2026-04-22", "2026-04-21")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Return date must be on or after");
    }

    @Test
    void createRejectsWhenAssetAlreadyHasActiveBorrowWorkflow() {
        when(currentUserService.currentUser()).thenReturn(requester);
        when(authorizationService.canRequestBorrow(requester)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(authorizationService.canViewAsset(requester, asset)).thenReturn(true);
        when(borrowRequestRepository.existsByAsset_IdAndStatusIn(eq(asset.getId()), any(Set.class))).thenReturn(true);

        assertThatThrownBy(() -> service.create(request("2026-04-20", "2026-04-21")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("active borrow workflow");
    }

    @Test
    void createPersistsPendingBorrowRequestForCurrentUser() {
        WorkflowDtos.BorrowRequestResponse response = response("request-1", BorrowStatus.PENDING_APPROVAL);
        when(currentUserService.currentUser()).thenReturn(requester);
        when(authorizationService.canRequestBorrow(requester)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(authorizationService.canViewAsset(requester, asset)).thenReturn(true);
        when(borrowRequestRepository.existsByAsset_IdAndStatusIn(eq(asset.getId()), any(Set.class))).thenReturn(false);
        when(borrowRequestRepository.save(any(BorrowRequest.class))).thenAnswer(invocation -> {
            BorrowRequest saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });
        when(workflowMapper.toBorrowRequestResponse(any(BorrowRequest.class))).thenReturn(response);

        WorkflowDtos.BorrowRequestResponse result = service.create(request("2026-04-20", "2026-04-21"));

        ArgumentCaptor<BorrowRequest> captor = ArgumentCaptor.forClass(BorrowRequest.class);
        verify(borrowRequestRepository).save(captor.capture());
        assertThat(captor.getValue().getRequester()).isEqualTo(requester);
        assertThat(captor.getValue().getDepartment()).isEqualTo(requester.getDepartment());
        assertThat(captor.getValue().getStatus()).isEqualTo(BorrowStatus.PENDING_APPROVAL);
        assertThat(result.status()).isEqualTo(BorrowStatus.PENDING_APPROVAL.getValue());
    }

    @Test
    void approveRejectsUnauthorizedReviewers() {
        BorrowRequest borrowRequest = TestDataFactory.borrowRequest(asset, requester, BorrowStatus.PENDING_APPROVAL);
        when(currentUserService.currentUser()).thenReturn(requester);
        when(borrowRequestRepository.findById(borrowRequest.getId())).thenReturn(Optional.of(borrowRequest));
        when(authorizationService.canApproveBorrowRequest(requester, borrowRequest)).thenReturn(false);

        assertThatThrownBy(() -> service.approve(borrowRequest.getId(), new WorkflowDtos.DecisionRequest("ok")))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("review this request");
    }

    @Test
    void approveRejectsNonPendingRequests() {
        AppUser approver = TestDataFactory.user(UserRole.MANAGER, requester.getDepartment(), "manager");
        BorrowRequest borrowRequest = TestDataFactory.borrowRequest(asset, requester, BorrowStatus.APPROVED);
        when(currentUserService.currentUser()).thenReturn(approver);
        when(borrowRequestRepository.findById(borrowRequest.getId())).thenReturn(Optional.of(borrowRequest));
        when(authorizationService.canApproveBorrowRequest(approver, borrowRequest)).thenReturn(true);

        assertThatThrownBy(() -> service.approve(borrowRequest.getId(), new WorkflowDtos.DecisionRequest("ok")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Only pending borrow requests");
    }

    @Test
    void approveTransitionsRequestAndCreatesApprovalNotification() {
        AppUser approver = TestDataFactory.user(UserRole.MANAGER, requester.getDepartment(), "manager");
        BorrowRequest borrowRequest = TestDataFactory.borrowRequest(asset, requester, BorrowStatus.PENDING_APPROVAL);
        WorkflowDtos.BorrowRequestResponse response = response(borrowRequest.getId().toString(), BorrowStatus.APPROVED);
        when(currentUserService.currentUser()).thenReturn(approver);
        when(borrowRequestRepository.findById(borrowRequest.getId())).thenReturn(Optional.of(borrowRequest));
        when(authorizationService.canApproveBorrowRequest(approver, borrowRequest)).thenReturn(true);
        when(borrowRequestRepository.save(borrowRequest)).thenReturn(borrowRequest);
        when(workflowMapper.toBorrowRequestResponse(borrowRequest)).thenReturn(response);

        WorkflowDtos.BorrowRequestResponse result = service.approve(borrowRequest.getId(), new WorkflowDtos.DecisionRequest("Approved"));

        assertThat(borrowRequest.getStatus()).isEqualTo(BorrowStatus.APPROVED);
        assertThat(borrowRequest.getApprovedBy()).isEqualTo(approver);
        assertThat(result.status()).isEqualTo(BorrowStatus.APPROVED.getValue());
        verify(notificationService).create(eq(requester), any(), any(), any(), eq("BorrowRequest"), eq(borrowRequest.getId().toString()), eq(approver.getFullName()), eq("normal"));
    }

    private WorkflowDtos.BorrowRequestCreateRequest request(String borrowDate, String returnDate) {
        return new WorkflowDtos.BorrowRequestCreateRequest(asset.getId().toString(), borrowDate, returnDate, "Demo purpose", "Notes");
    }

    private WorkflowDtos.BorrowRequestResponse response(String id, BorrowStatus status) {
        return new WorkflowDtos.BorrowRequestResponse(
            id,
            asset.getId().toString(),
            asset.getCode(),
            asset.getName(),
            requester.getId().toString(),
            requester.getFullName(),
            requester.getDepartment().getId().toString(),
            requester.getDepartment().getName(),
            "2026-04-20",
            "2026-04-21",
            "Demo purpose",
            "Notes",
            status.getValue(),
            null,
            null,
            null,
            null,
            "2026-04-16T00:00:00Z"
        );
    }
}
