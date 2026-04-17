package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.UserMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.security.PermissionService;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserListCoverageTest {

    @Mock private AppUserRepository appUserRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;
    @Mock private AuditService auditService;

    private UserService service;
    private AppUser admin;
    private AppUser employee;

    @BeforeEach
    void setUp() {
        Department department = TestDataFactory.department("IT");
        admin = TestDataFactory.user(UserRole.ADMIN, department, "admin");
        employee = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        employee.setFullName("Alpha Employee");
        service = new UserService(
            appUserRepository,
            departmentRepository,
            new UserMapper(),
            pageResponseFactory,
            passwordEncoder,
            currentUserService,
            authorizationService,
            auditService,
            new PermissionService()
        );
    }

    @Test
    void listRejectsUsersWithoutManagementPermission() {
        when(currentUserService.currentUser()).thenReturn(employee);
        when(authorizationService.canManageUsers(employee)).thenReturn(false);

        assertThatThrownBy(() -> service.list(null, null, null, 0, 10))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("Only admins can manage users");
    }

    @Test
    void listAppliesRoleStatusAndSearchFilters() {
        CommonDtos.PageResponse<UserDtos.UserResponse> page = new CommonDtos.PageResponse<>(
            List.of(new UserDtos.UserResponse(employee.getId().toString(), employee.getUsername(), employee.getFullName(), employee.getEmail(), employee.getRole().getValue(), employee.getDepartment().getId().toString(), employee.getDepartment().getName(), employee.getStatus().getValue(), null, null, employee.getCreatedAt().toString())),
            1, 0, 10, 1
        );
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageUsers(admin)).thenReturn(true);
        when(appUserRepository.findAll()).thenReturn(List.of(admin, employee));
        doReturn(page).when(pageResponseFactory).create(org.mockito.ArgumentMatchers.anyList(), org.mockito.ArgumentMatchers.eq(0), org.mockito.ArgumentMatchers.eq(10));

        CommonDtos.PageResponse<UserDtos.UserResponse> result = service.list("Alpha", "employee", "active", 0, 10);

        assertThat(result.items()).singleElement().extracting(UserDtos.UserResponse::name).isEqualTo("Alpha Employee");
    }
}
