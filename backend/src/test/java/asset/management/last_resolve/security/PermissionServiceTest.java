package asset.management.last_resolve.security;

import static org.assertj.core.api.Assertions.assertThat;

import asset.management.last_resolve.enums.UserRole;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;

class PermissionServiceTest {

    private final PermissionService permissionService = new PermissionService();

    @ParameterizedTest
    @EnumSource(UserRole.class)
    void grantsForEveryRoleIncludesCommonPermissions(UserRole role) {
        Set<String> grants = permissionService.grantsFor(role);

        assertThat(grants)
            .contains(
                PermissionGrant.DASHBOARD_READ,
                PermissionGrant.NOTIFICATIONS_READ,
                PermissionGrant.PROFILE_READ,
                PermissionGrant.PROFILE_WRITE
            );
    }

    @ParameterizedTest
    @MethodSource("roleGrantExpectations")
    void grantsMatchRoleCapabilities(UserRole role, String includedGrant, String excludedGrant) {
        Set<String> grants = permissionService.grantsFor(role);

        assertThat(grants).contains(includedGrant);
        assertThat(grants).doesNotContain(excludedGrant);
    }

    private static Stream<org.junit.jupiter.params.provider.Arguments> roleGrantExpectations() {
        return Stream.of(
            org.junit.jupiter.params.provider.Arguments.of(UserRole.OFFICER, PermissionGrant.ASSETS_MANAGE, PermissionGrant.USERS_MANAGE),
            org.junit.jupiter.params.provider.Arguments.of(UserRole.MANAGER, PermissionGrant.BORROWS_APPROVE, PermissionGrant.ASSETS_MANAGE),
            org.junit.jupiter.params.provider.Arguments.of(UserRole.EMPLOYEE, PermissionGrant.BORROWS_REQUEST, PermissionGrant.BORROWS_APPROVE),
            org.junit.jupiter.params.provider.Arguments.of(UserRole.TECHNICIAN, PermissionGrant.MAINTENANCE_MANAGE, PermissionGrant.BORROWS_REQUEST),
            org.junit.jupiter.params.provider.Arguments.of(UserRole.AUDITOR, PermissionGrant.VERIFICATION_MANAGE, PermissionGrant.USERS_MANAGE)
        );
    }
}
