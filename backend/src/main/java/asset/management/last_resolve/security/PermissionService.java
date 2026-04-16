package asset.management.last_resolve.security;

import asset.management.last_resolve.enums.UserRole;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class PermissionService {

    private static final List<String> COMMON = List.of(
        PermissionGrant.DASHBOARD_READ,
        PermissionGrant.NOTIFICATIONS_READ,
        PermissionGrant.PROFILE_READ,
        PermissionGrant.PROFILE_WRITE
    );

    private static final Map<UserRole, List<String>> ROLE_GRANTS = Map.of(
        UserRole.ADMIN, merge(
            COMMON,
            PermissionGrant.ASSETS_READ,
            PermissionGrant.ASSETS_MANAGE,
            PermissionGrant.ASSIGNMENTS_READ,
            PermissionGrant.ASSIGNMENTS_MANAGE,
            PermissionGrant.BORROWS_READ,
            PermissionGrant.BORROWS_REQUEST,
            PermissionGrant.BORROWS_APPROVE,
            PermissionGrant.VERIFICATION_READ,
            PermissionGrant.VERIFICATION_MANAGE,
            PermissionGrant.DISCREPANCIES_READ,
            PermissionGrant.DISCREPANCIES_MANAGE,
            PermissionGrant.MAINTENANCE_READ,
            PermissionGrant.MAINTENANCE_MANAGE,
            PermissionGrant.DISPOSAL_READ,
            PermissionGrant.DISPOSAL_MANAGE,
            PermissionGrant.REPORTS_READ,
            PermissionGrant.USERS_MANAGE,
            PermissionGrant.REFERENCE_READ,
            PermissionGrant.REFERENCE_MANAGE
        ),
        UserRole.OFFICER, merge(
            COMMON,
            PermissionGrant.ASSETS_READ,
            PermissionGrant.ASSETS_MANAGE,
            PermissionGrant.ASSIGNMENTS_READ,
            PermissionGrant.ASSIGNMENTS_MANAGE,
            PermissionGrant.BORROWS_READ,
            PermissionGrant.BORROWS_REQUEST,
            PermissionGrant.BORROWS_APPROVE,
            PermissionGrant.VERIFICATION_READ,
            PermissionGrant.VERIFICATION_MANAGE,
            PermissionGrant.DISCREPANCIES_READ,
            PermissionGrant.DISCREPANCIES_MANAGE,
            PermissionGrant.MAINTENANCE_READ,
            PermissionGrant.MAINTENANCE_MANAGE,
            PermissionGrant.DISPOSAL_READ,
            PermissionGrant.DISPOSAL_MANAGE,
            PermissionGrant.REPORTS_READ,
            PermissionGrant.REFERENCE_READ
        ),
        UserRole.MANAGER, merge(
            COMMON,
            PermissionGrant.ASSETS_READ,
            PermissionGrant.ASSIGNMENTS_READ,
            PermissionGrant.BORROWS_READ,
            PermissionGrant.BORROWS_REQUEST,
            PermissionGrant.BORROWS_APPROVE,
            PermissionGrant.VERIFICATION_READ,
            PermissionGrant.DISCREPANCIES_READ,
            PermissionGrant.DISPOSAL_READ,
            PermissionGrant.REPORTS_READ,
            PermissionGrant.REFERENCE_READ
        ),
        UserRole.EMPLOYEE, merge(
            COMMON,
            PermissionGrant.ASSETS_READ,
            PermissionGrant.ASSIGNMENTS_READ,
            PermissionGrant.BORROWS_READ,
            PermissionGrant.BORROWS_REQUEST
        ),
        UserRole.TECHNICIAN, merge(
            COMMON,
            PermissionGrant.ASSETS_READ,
            PermissionGrant.MAINTENANCE_READ,
            PermissionGrant.MAINTENANCE_MANAGE
        ),
        UserRole.AUDITOR, merge(
            COMMON,
            PermissionGrant.ASSETS_READ,
            PermissionGrant.VERIFICATION_READ,
            PermissionGrant.VERIFICATION_MANAGE,
            PermissionGrant.DISCREPANCIES_READ,
            PermissionGrant.DISCREPANCIES_MANAGE,
            PermissionGrant.REPORTS_READ
        )
    );

    public Set<String> grantsFor(UserRole role) {
        return new LinkedHashSet<>(ROLE_GRANTS.getOrDefault(role, COMMON));
    }

    private static List<String> merge(List<String> common, String... grants) {
        LinkedHashSet<String> merged = new LinkedHashSet<>(common);
        merged.addAll(Arrays.asList(grants));
        return List.copyOf(merged);
    }
}
