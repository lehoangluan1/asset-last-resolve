package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.AuthDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.enums.UserStatus;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.UserMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.security.PermissionGrant;
import asset.management.last_resolve.security.PermissionService;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private AppUserRepository appUserRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private PageResponseFactory pageResponseFactory;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private AuthorizationService authorizationService;
    @Mock
    private AuditService auditService;

    private UserService userService;
    private Department department;
    private AppUser admin;

    @BeforeEach
    void setUp() {
        department = TestDataFactory.department("IT");
        admin = TestDataFactory.user(UserRole.ADMIN, department, "admin");
        userService = new UserService(
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
    void createRejectsNonAdminUsers() {
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, department, "manager");
        when(currentUserService.currentUser()).thenReturn(manager);
        when(authorizationService.canManageUsers(manager)).thenReturn(false);

        assertThatThrownBy(() -> userService.create(request("newuser", "new@example.com")))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("Only admins can create users");
    }

    @Test
    void createRejectsDuplicateUsername() {
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageUsers(admin)).thenReturn(true);
        when(appUserRepository.findByUsernameIgnoreCase("newuser")).thenReturn(Optional.of(TestDataFactory.user(UserRole.EMPLOYEE, department, "existing")));

        assertThatThrownBy(() -> userService.create(request("newuser", "new@example.com")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Username is already in use");
    }

    @Test
    void createRejectsDuplicateEmail() {
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageUsers(admin)).thenReturn(true);
        when(appUserRepository.findByUsernameIgnoreCase("newuser")).thenReturn(Optional.empty());
        when(appUserRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.of(TestDataFactory.user(UserRole.EMPLOYEE, department, "existing")));

        assertThatThrownBy(() -> userService.create(request("newuser", "new@example.com")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Email address is already in use");
    }

    @Test
    void createAssignsDefaultPasswordAndSavesUser() {
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageUsers(admin)).thenReturn(true);
        when(appUserRepository.findByUsernameIgnoreCase("newuser")).thenReturn(Optional.empty());
        when(appUserRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        when(passwordEncoder.encode("demo123")).thenReturn("encoded-default");
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser user = invocation.getArgument(0);
            user.setId(java.util.UUID.randomUUID());
            return user;
        });

        UserDtos.UserResponse response = userService.create(request("newuser", "new@example.com"));

        ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
        verify(appUserRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("encoded-default");
        assertThat(captor.getValue().getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(response.username()).isEqualTo("newuser");
    }

    @Test
    void updateAllowsCurrentUserToKeepOwnUsernameAndEmail() {
        AppUser existing = TestDataFactory.user(UserRole.EMPLOYEE, department, "existing");
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageUsers(admin)).thenReturn(true);
        when(appUserRepository.findById(existing.getId())).thenReturn(Optional.of(existing));
        when(appUserRepository.findByUsernameIgnoreCase("existing")).thenReturn(Optional.of(existing));
        when(appUserRepository.findByEmailIgnoreCase("existing@example.com")).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        when(appUserRepository.save(existing)).thenReturn(existing);

        UserDtos.UserResponse response = userService.update(
            existing.getId(),
            new UserDtos.UserUpsertRequest("existing", "Updated Name", "existing@example.com", UserRole.MANAGER.getValue(), department.getId().toString(), true, "+1-555")
        );

        assertThat(existing.getFullName()).isEqualTo("Updated Name");
        assertThat(existing.getRole()).isEqualTo(UserRole.MANAGER);
        assertThat(response.name()).isEqualTo("Updated Name");
    }

    @Test
    void resetPasswordRestoresDefaultAndReactivatesUser() {
        AppUser target = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        target.setStatus(UserStatus.INACTIVE);
        target.setActive(false);
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageUsers(admin)).thenReturn(true);
        when(appUserRepository.findById(target.getId())).thenReturn(Optional.of(target));
        when(passwordEncoder.encode("demo123")).thenReturn("encoded-default");

        userService.resetPassword(target.getId());

        assertThat(target.getPasswordHash()).isEqualTo("encoded-default");
        assertThat(target.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(target.isActive()).isTrue();
        verify(appUserRepository).save(target);
    }

    @Test
    void toggleStatusFlipsBetweenActiveAndInactive() {
        AppUser target = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageUsers(admin)).thenReturn(true);
        when(appUserRepository.findById(target.getId())).thenReturn(Optional.of(target));
        when(appUserRepository.save(target)).thenReturn(target);

        userService.toggleStatus(target.getId());
        assertThat(target.getStatus()).isEqualTo(UserStatus.INACTIVE);

        userService.toggleStatus(target.getId());
        assertThat(target.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void updateProfileReturnsAuthenticatedUserWithGrants() {
        AppUser target = TestDataFactory.user(UserRole.MANAGER, department, "manager");
        when(currentUserService.currentUser()).thenReturn(target);
        when(appUserRepository.save(target)).thenReturn(target);

        AuthDtos.AuthenticatedUserResponse response = userService.updateProfile(new UserDtos.ProfileUpdateRequest("+1-555", "Manager bio"));

        assertThat(target.getPhone()).isEqualTo("+1-555");
        assertThat(target.getBio()).isEqualTo("Manager bio");
        assertThat(response.grants()).contains(PermissionGrant.BORROWS_APPROVE);
    }

    private UserDtos.UserUpsertRequest request(String username, String email) {
        return new UserDtos.UserUpsertRequest(username, "New User", email, UserRole.EMPLOYEE.getValue(), department.getId().toString(), true, "+1-555");
    }
}
