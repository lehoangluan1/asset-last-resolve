package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.DiscrepancyRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DiscrepancyReadCoverageTest {

    @Mock private DiscrepancyRepository discrepancyRepository;
    @Mock private MaintenanceRecordRepository maintenanceRecordRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private WorkflowMapper workflowMapper;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;
    @Mock private AuditService auditService;

    private DiscrepancyService service;
    private AppUser auditor;
    private Discrepancy discrepancy;

    @BeforeEach
    void setUp() {
        service = new DiscrepancyService(
            discrepancyRepository,
            maintenanceRecordRepository,
            appUserRepository,
            workflowMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService,
            auditService
        );

        Department department = TestDataFactory.department("IT");
        auditor = TestDataFactory.user(UserRole.AUDITOR, department, "auditor");
        VerificationCampaign campaign = TestDataFactory.campaign("VER-READ", CampaignStatus.ACTIVE, Set.of(department), auditor);
        Asset asset = TestDataFactory.asset(department, null, false, LifecycleStatus.IN_USE);
        discrepancy = TestDataFactory.discrepancy(campaign, asset, auditor, DiscrepancyStatus.OPEN);
    }

    @Test
    void listReturnsOnlyVisibleDiscrepanciesMatchingFilters() {
        WorkflowDtos.DiscrepancyResponse response = new WorkflowDtos.DiscrepancyResponse(
            discrepancy.getId().toString(),
            discrepancy.getCampaign().getId().toString(),
            discrepancy.getTask().getId().toString(),
            discrepancy.getAsset().getId().toString(),
            discrepancy.getAsset().getCode(),
            discrepancy.getAsset().getName(),
            discrepancy.getType().getValue(),
            discrepancy.getSeverity().getValue(),
            discrepancy.getStatus().getValue(),
            discrepancy.getExpectedValue(),
            discrepancy.getObservedValue(),
            discrepancy.getRootCause(),
            discrepancy.getResolution(),
            null,
            null,
            discrepancy.getCreatedAt().toString()
        );
        CommonDtos.PageResponse<WorkflowDtos.DiscrepancyResponse> page = new CommonDtos.PageResponse<>(List.of(response), 1, 0, 10, 1);
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(discrepancyRepository.findAll()).thenReturn(List.of(discrepancy));
        when(authorizationService.canViewDiscrepancy(auditor, discrepancy)).thenReturn(true);
        when(workflowMapper.toDiscrepancyResponse(discrepancy)).thenReturn(response);
        when(pageResponseFactory.create(List.of(response), 0, 10)).thenReturn(page);

        CommonDtos.PageResponse<WorkflowDtos.DiscrepancyResponse> result = service.list(discrepancy.getAsset().getCode(), "open", discrepancy.getSeverity().getValue(), 0, 10);

        assertThat(result.items()).containsExactly(response);
    }

    @Test
    void getRejectsOutOfScopeDiscrepancies() {
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(discrepancyRepository.findById(discrepancy.getId())).thenReturn(Optional.of(discrepancy));
        when(authorizationService.canViewDiscrepancy(auditor, discrepancy)).thenReturn(false);

        assertThatThrownBy(() -> service.get(discrepancy.getId()))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("do not have access");
    }
}
