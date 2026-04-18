package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.AssetDtos;
import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.SearchDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.security.AuthenticatedUser;
import asset.management.last_resolve.security.PermissionGrant;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SearchServiceCoverageTest {

    @Mock private AssetService assetService;
    @Mock private AssignmentService assignmentService;
    @Mock private BorrowRequestService borrowRequestService;
    @Mock private MaintenanceService maintenanceService;
    @Mock private VerificationService verificationService;
    @Mock private DiscrepancyService discrepancyService;
    @Mock private DisposalService disposalService;
    @Mock private UserService userService;
    @Mock private CurrentUserService currentUserService;

    private SearchService service;
    private AppUser admin;

    @BeforeEach
    void setUp() {
        service = new SearchService(
            assetService,
            assignmentService,
            borrowRequestService,
            maintenanceService,
            verificationService,
            discrepancyService,
            disposalService,
            userService,
            currentUserService
        );

        Department department = TestDataFactory.department("IT");
        admin = TestDataFactory.user(UserRole.ADMIN, department, "admin");
    }

    @Test
    void blankQueriesReturnEmptySearchResponse() {
        SearchDtos.SearchResponse result = service.search("   ");

        assertThat(result.totalResults()).isZero();
        assertThat(result.sections()).isEmpty();
    }

    @Test
    void searchBuildsSectionsOnlyForGrantedDomains() {
        when(currentUserService.currentPrincipal()).thenReturn(new AuthenticatedUser(admin, Set.of(PermissionGrant.ASSETS_READ, PermissionGrant.USERS_MANAGE)));
        when(assetService.list("PowerEdge", null, null, 0, 5)).thenReturn(new CommonDtos.PageResponse<>(
            List.of(new AssetDtos.AssetResponse("asset-1", "AST-1003", "Dell PowerEdge R750", "desc", null, null, null, "IT", null, null, null, "Server Room", "good", "in-use", null, null, null, null, null, null, false, null, null, null, null)),
            1, 0, 5, 1
        ));
        when(userService.list("PowerEdge", null, null, 0, 5)).thenReturn(new CommonDtos.PageResponse<>(
            List.of(new UserDtos.UserResponse("user-1", "sarah", "Sarah Chen", "sarah@example.com", "admin", "dep-1", "IT", "active", null, null, null)),
            1, 0, 5, 1
        ));

        SearchDtos.SearchResponse result = service.search("PowerEdge");

        assertThat(result.query()).isEqualTo("PowerEdge");
        assertThat(result.sections()).extracting(SearchDtos.SearchSectionResponse::key).containsExactly("assets", "users");
        assertThat(result.totalResults()).isEqualTo(2);
    }

    @Test
    void searchIncludesWorkflowSectionsWhenGranted() {
        when(currentUserService.currentPrincipal()).thenReturn(new AuthenticatedUser(admin, Set.of(PermissionGrant.BORROWS_READ, PermissionGrant.MAINTENANCE_READ)));
        when(borrowRequestService.list("Laptop", null, 0, 5)).thenReturn(new CommonDtos.PageResponse<>(
            List.of(new WorkflowDtos.BorrowRequestResponse("borrow-1", "asset-1", "AST-1", "Laptop", "cat-1", "LAP", "Laptops", "user-1", "User", "dep-1", "IT", "individual", "2026-04-20", "2026-04-22", "Coverage", null, "pending-approval", null, null, null, null, "2026-04-16T00:00:00Z")),
            1, 0, 5, 1
        ));
        when(maintenanceService.list("Laptop", null, 0, 5)).thenReturn(new CommonDtos.PageResponse<>(
            List.of(new WorkflowDtos.MaintenanceRecordResponse("maint-1", "asset-1", "AST-1", "Laptop", "Inspection", "Inspect", "good", "scheduled", "normal", "user-1", "Tech", "2026-04-20", null, 0.0, "Notes", "2026-04-16T00:00:00Z")),
            1, 0, 5, 1
        ));

        SearchDtos.SearchResponse result = service.search("Laptop");

        assertThat(result.sections()).extracting(SearchDtos.SearchSectionResponse::key).containsExactly("borrow-requests", "maintenance");
    }
}
