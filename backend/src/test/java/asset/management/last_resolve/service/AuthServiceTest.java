package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.AuthDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.mapper.UserMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.security.AuthenticatedUser;
import asset.management.last_resolve.security.JwtProperties;
import asset.management.last_resolve.security.JwtService;
import asset.management.last_resolve.security.PermissionGrant;
import asset.management.last_resolve.security.PermissionService;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private AppUserRepository appUserRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private Authentication authentication;

    private AuthService authService;
    private AppUser user;

    @BeforeEach
    void setUp() {
        Department department = TestDataFactory.department("IT");
        user = TestDataFactory.user(UserRole.ADMIN, department, "admin");
        authService = new AuthService(
            authenticationManager,
            appUserRepository,
            jwtService,
            new JwtProperties("secret", 3600, true),
            new UserMapper(),
            new PermissionService(),
            currentUserService,
            passwordEncoder
        );
    }

    @Test
    void loginReturnsTokenAndUpdatesLastLogin() {
        AuthenticatedUser principal = new AuthenticatedUser(user, Set.of(PermissionGrant.USERS_MANAGE, PermissionGrant.DASHBOARD_READ));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(appUserRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(appUserRepository.save(user)).thenReturn(user);
        when(jwtService.generateToken(principal)).thenReturn("jwt-token");

        AuthDtos.AuthResponse response = authService.login(new AuthDtos.LoginRequest("admin", "demo123"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().username()).isEqualTo("admin");
        assertThat(response.user().grants()).contains(PermissionGrant.USERS_MANAGE);
        assertThat(user.getLastLoginAt()).isNotNull();
    }

    @Test
    void loginFailsWhenAuthenticatedUserCannotBeReloaded() {
        AuthenticatedUser principal = new AuthenticatedUser(user, Set.of(PermissionGrant.DASHBOARD_READ));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(appUserRepository.findById(user.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new AuthDtos.LoginRequest("admin", "demo123")))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Authenticated user not found");
    }

    @Test
    void meReturnsMappedAuthenticatedUser() {
        when(currentUserService.currentUser()).thenReturn(user);

        AuthDtos.AuthenticatedUserResponse response = authService.me();

        assertThat(response.username()).isEqualTo("admin");
        assertThat(response.role()).isEqualTo(user.getRole().getValue());
        assertThat(response.grants()).contains(PermissionGrant.DASHBOARD_READ);
    }

    @Test
    void changePasswordRejectsMismatchedConfirmation() {
        when(currentUserService.currentUser()).thenReturn(user);

        assertThatThrownBy(() -> authService.changePassword(new AuthDtos.ChangePasswordRequest("old", "newpass", "wrong")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("do not match");
    }

    @Test
    void changePasswordRejectsWrongCurrentPassword() {
        when(currentUserService.currentUser()).thenReturn(user);
        when(passwordEncoder.matches("old", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(new AuthDtos.ChangePasswordRequest("old", "newpass", "newpass")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Current password is incorrect");
    }

    @Test
    void changePasswordUpdatesStoredHash() {
        when(currentUserService.currentUser()).thenReturn(user);
        when(passwordEncoder.matches("old", user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("newpass")).thenReturn("encoded-newpass");

        authService.changePassword(new AuthDtos.ChangePasswordRequest("old", "newpass", "newpass"));

        assertThat(user.getPasswordHash()).isEqualTo("encoded-newpass");
        verify(appUserRepository).save(user);
    }
}
