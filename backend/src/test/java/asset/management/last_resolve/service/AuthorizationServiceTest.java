package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;

import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Assignment;
import asset.management.last_resolve.entity.AuditLog;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.DisposalRequest;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.support.TestDataFactory;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class AuthorizationServiceTest {

    private AuthorizationService authorizationService;
    private Department itDepartment;
    private Department hrDepartment;

    @BeforeEach
    void setUp() {
        authorizationService = new AuthorizationService();
        itDepartment = TestDataFactory.department("IT");
        hrDepartment = TestDataFactory.department("HR");
    }

    @ParameterizedTest
    @MethodSource("manageUsersCases")
    void canManageUsersMatchesAdminRole(UserRole role, boolean expected) {
        AppUser user = TestDataFactory.user(role, itDepartment, role.name().toLowerCase());

        assertThat(authorizationService.canManageUsers(user)).isEqualTo(expected);
    }

    @ParameterizedTest
    @MethodSource("manageAssetsCases")
    void canManageAssetsMatchesOperationalRoles(UserRole role, boolean expected) {
        AppUser user = TestDataFactory.user(role, itDepartment, role.name().toLowerCase());

        assertThat(authorizationService.canManageAssets(user)).isEqualTo(expected);
    }

    @ParameterizedTest
    @MethodSource("requestBorrowCases")
    void canRequestBorrowMatchesAllowedRoles(UserRole role, boolean expected) {
        AppUser user = TestDataFactory.user(role, itDepartment, role.name().toLowerCase());

        assertThat(authorizationService.canRequestBorrow(user)).isEqualTo(expected);
    }

    @Test
    void canApproveBorrowRequestAllowsManagerForOwnDepartment() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, itDepartment, "manager");
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        Asset asset = TestDataFactory.asset(itDepartment, employee, true, LifecycleStatus.IN_STORAGE);
        BorrowRequest request = TestDataFactory.borrowRequest(asset, employee, BorrowStatus.PENDING_APPROVAL);

        assertThat(authorizationService.canApproveBorrowRequest(manager, request)).isTrue();
    }

    @Test
    void canApproveBorrowRequestDeniesManagerOutsideDepartment() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, hrDepartment, "manager");
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        Asset asset = TestDataFactory.asset(itDepartment, employee, true, LifecycleStatus.IN_STORAGE);
        BorrowRequest request = TestDataFactory.borrowRequest(asset, employee, BorrowStatus.PENDING_APPROVAL);

        assertThat(authorizationService.canApproveBorrowRequest(manager, request)).isFalse();
    }

    @Test
    void canViewAssetAllowsDepartmentManagerForDepartmentAsset() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, itDepartment, "manager");
        Asset asset = TestDataFactory.asset(itDepartment, null, false, LifecycleStatus.IN_USE);

        assertThat(authorizationService.canViewAsset(manager, asset)).isTrue();
    }

    @Test
    void canViewAssetDeniesDepartmentManagerForDifferentDepartmentAsset() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, itDepartment, "manager");
        Asset asset = TestDataFactory.asset(hrDepartment, null, false, LifecycleStatus.IN_USE);

        assertThat(authorizationService.canViewAsset(manager, asset)).isFalse();
    }

    @Test
    void canViewAssetAllowsEmployeeForAssignedAsset() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        Asset asset = TestDataFactory.asset(hrDepartment, employee, false, LifecycleStatus.IN_USE);

        assertThat(authorizationService.canViewAsset(employee, asset)).isTrue();
    }

    @Test
    void canViewAssetAllowsEmployeeForBorrowableDepartmentAsset() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        Asset asset = TestDataFactory.asset(itDepartment, null, true, LifecycleStatus.IN_STORAGE);

        assertThat(authorizationService.canViewAsset(employee, asset)).isTrue();
    }

    @Test
    void canViewAssetDeniesEmployeeOutsideScope() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        Asset asset = TestDataFactory.asset(hrDepartment, null, false, LifecycleStatus.IN_STORAGE);

        assertThat(authorizationService.canViewAsset(employee, asset)).isFalse();
    }

    @Test
    void canViewAssignmentAllowsRecipient() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        Asset asset = TestDataFactory.asset(itDepartment, employee, false, LifecycleStatus.IN_USE);
        Assignment assignment = TestDataFactory.assignment(asset, employee, itDepartment);

        assertThat(authorizationService.canViewAssignment(employee, assignment)).isTrue();
    }

    @Test
    void canViewBorrowRequestAllowsRequester() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        Asset asset = TestDataFactory.asset(itDepartment, employee, true, LifecycleStatus.IN_STORAGE);
        BorrowRequest request = TestDataFactory.borrowRequest(asset, employee, BorrowStatus.PENDING_APPROVAL);

        assertThat(authorizationService.canViewBorrowRequest(employee, request)).isTrue();
    }

    @Test
    void canViewMaintenanceAllowsAssignedTechnician() {
        AppUser technician = TestDataFactory.user(UserRole.TECHNICIAN, hrDepartment, "tech");
        Asset asset = TestDataFactory.asset(itDepartment, null, false, LifecycleStatus.UNDER_MAINTENANCE);
        MaintenanceRecord record = TestDataFactory.maintenanceRecord(asset, technician, MaintenanceStatus.SCHEDULED);

        assertThat(authorizationService.canViewMaintenance(technician, record)).isTrue();
    }

    @Test
    void canViewMaintenanceAllowsAssetAssignee() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, hrDepartment, "employee");
        AppUser technician = TestDataFactory.user(UserRole.TECHNICIAN, itDepartment, "tech");
        Asset asset = TestDataFactory.asset(itDepartment, employee, false, LifecycleStatus.UNDER_MAINTENANCE);
        MaintenanceRecord record = TestDataFactory.maintenanceRecord(asset, technician, MaintenanceStatus.SCHEDULED);

        assertThat(authorizationService.canViewMaintenance(employee, record)).isTrue();
    }

    @Test
    void canViewDiscrepancyAllowsManagerInDepartment() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, itDepartment, "manager");
        VerificationCampaign campaign = TestDataFactory.campaign("VER-1", CampaignStatus.ACTIVE, Set.of(itDepartment), manager);
        Asset asset = TestDataFactory.asset(itDepartment, null, false, LifecycleStatus.IN_USE);
        Discrepancy discrepancy = TestDataFactory.discrepancy(campaign, asset, manager, DiscrepancyStatus.OPEN);

        assertThat(authorizationService.canViewDiscrepancy(manager, discrepancy)).isTrue();
    }

    @Test
    void canViewDisposalAllowsManagerInDepartment() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, itDepartment, "manager");
        Asset asset = TestDataFactory.asset(itDepartment, null, false, LifecycleStatus.PENDING_DISPOSAL);
        DisposalRequest request = new DisposalRequest();
        request.setAsset(asset);

        assertThat(authorizationService.canViewDisposal(manager, request)).isTrue();
    }

    @Test
    void canViewVerificationCampaignAllowsManagerForAssignedDepartment() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, itDepartment, "manager");
        VerificationCampaign campaign = TestDataFactory.campaign("VER-1", CampaignStatus.ACTIVE, Set.of(itDepartment), manager);

        assertThat(authorizationService.canViewVerificationCampaign(manager, campaign)).isTrue();
    }

    @Test
    void canViewVerificationCampaignDeniesManagerOutsideCampaignDepartments() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, hrDepartment, "manager");
        VerificationCampaign campaign = TestDataFactory.campaign("VER-1", CampaignStatus.ACTIVE, Set.of(itDepartment), manager);

        assertThat(authorizationService.canViewVerificationCampaign(manager, campaign)).isFalse();
    }

    @Test
    void canViewAuditLogAllowsOfficerForAnyEntry() {
        AppUser officer = TestDataFactory.user(UserRole.OFFICER, itDepartment, "officer");
        AuditLog log = TestDataFactory.auditLog("Asset", "asset-1", officer);

        assertThat(authorizationService.canViewAuditLog(officer, log, Set.of())).isTrue();
    }

    @Test
    void canViewAuditLogAllowsUserForOwnEntity() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        AuditLog log = TestDataFactory.auditLog("User", employee.getId().toString(), null);
        log.setActorName("System");

        assertThat(authorizationService.canViewAuditLog(employee, log, Set.of())).isTrue();
    }

    @Test
    void canViewAuditLogAllowsActorToSeeOwnAction() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        AuditLog log = TestDataFactory.auditLog("Asset", "asset-1", employee);

        assertThat(authorizationService.canViewAuditLog(employee, log, Set.of())).isTrue();
    }

    @Test
    void canViewAuditLogAllowsVisibleEntityIds() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        AuditLog log = TestDataFactory.auditLog("BorrowRequest", "request-1", null);
        log.setActorName("System");

        assertThat(authorizationService.canViewAuditLog(employee, log, Set.of("request-1"))).isTrue();
    }

    @Test
    void canViewAuditLogDeniesHiddenEntry() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, itDepartment, "employee");
        AuditLog log = TestDataFactory.auditLog("BorrowRequest", "request-1", null);
        log.setActorName("System");
        log.setCreatedAt(OffsetDateTime.now());

        assertThat(authorizationService.canViewAuditLog(employee, log, Set.of("other-id"))).isFalse();
    }

    private static Stream<Arguments> manageUsersCases() {
        return Stream.of(
            Arguments.of(UserRole.ADMIN, true),
            Arguments.of(UserRole.OFFICER, false),
            Arguments.of(UserRole.MANAGER, false),
            Arguments.of(UserRole.EMPLOYEE, false),
            Arguments.of(UserRole.TECHNICIAN, false),
            Arguments.of(UserRole.AUDITOR, false)
        );
    }

    private static Stream<Arguments> manageAssetsCases() {
        return Stream.of(
            Arguments.of(UserRole.ADMIN, true),
            Arguments.of(UserRole.OFFICER, true),
            Arguments.of(UserRole.MANAGER, false),
            Arguments.of(UserRole.EMPLOYEE, false),
            Arguments.of(UserRole.TECHNICIAN, false),
            Arguments.of(UserRole.AUDITOR, false)
        );
    }

    private static Stream<Arguments> requestBorrowCases() {
        return Stream.of(
            Arguments.of(UserRole.ADMIN, true),
            Arguments.of(UserRole.OFFICER, true),
            Arguments.of(UserRole.MANAGER, true),
            Arguments.of(UserRole.EMPLOYEE, true),
            Arguments.of(UserRole.TECHNICIAN, false),
            Arguments.of(UserRole.AUDITOR, false)
        );
    }
}
