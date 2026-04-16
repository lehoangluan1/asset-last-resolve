package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.AuthDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.enums.UserStatus;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.UserMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.security.PermissionService;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String DEFAULT_PASSWORD = "demo123";

    private final AppUserRepository appUserRepository;
    private final DepartmentRepository departmentRepository;
    private final UserMapper userMapper;
    private final PageResponseFactory pageResponseFactory;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;
    private final PermissionService permissionService;

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<UserDtos.UserResponse> list(String search, String role, String status, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageUsers(currentUser)) {
            throw new asset.management.last_resolve.exception.ForbiddenOperationException("Only admins can manage users");
        }
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<UserDtos.UserResponse> items = appUserRepository.findAll().stream()
            .filter(user -> normalizedSearch.isBlank()
                || user.getFullName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || user.getEmail().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .filter(user -> role == null || role.isBlank() || role.equalsIgnoreCase("all") || user.getRole().getValue().equalsIgnoreCase(role))
            .filter(user -> status == null || status.isBlank() || status.equalsIgnoreCase("all") || user.getStatus().getValue().equalsIgnoreCase(status))
            .sorted(Comparator.comparing(AppUser::getCreatedAt).reversed())
            .map(userMapper::toUserResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }

    @Transactional
    public UserDtos.UserResponse create(UserDtos.UserUpsertRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageUsers(currentUser)) {
            throw new asset.management.last_resolve.exception.ForbiddenOperationException("Only admins can create users");
        }
        AppUser user = new AppUser();
        validateUniqueUserFields(null, request);
        apply(user, request);
        user.setPasswordHash(passwordEncoder.encode(DEFAULT_PASSWORD));
        AppUser saved = appUserRepository.save(user);
        auditService.log(currentUser, "Created User", "User", saved.getId().toString(), saved.getFullName(), "Registered new user account");
        return userMapper.toUserResponse(saved);
    }

    @Transactional
    public UserDtos.UserResponse update(UUID userId, UserDtos.UserUpsertRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageUsers(currentUser)) {
            throw new asset.management.last_resolve.exception.ForbiddenOperationException("Only admins can update users");
        }
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        validateUniqueUserFields(userId, request);
        apply(user, request);
        AppUser saved = appUserRepository.save(user);
        auditService.log(currentUser, "Updated User", "User", saved.getId().toString(), saved.getFullName(), "Updated user account details");
        return userMapper.toUserResponse(saved);
    }

    @Transactional
    public void resetPassword(UUID userId) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageUsers(currentUser)) {
            throw new asset.management.last_resolve.exception.ForbiddenOperationException("Only admins can reset passwords");
        }
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(DEFAULT_PASSWORD));
        user.setStatus(UserStatus.ACTIVE);
        user.setActive(true);
        appUserRepository.save(user);
        auditService.log(currentUser, "Reset Password", "User", user.getId().toString(), user.getFullName(), "Reset user password to the demo default");
    }

    @Transactional
    public UserDtos.UserResponse toggleStatus(UUID userId) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageUsers(currentUser)) {
            throw new asset.management.last_resolve.exception.ForbiddenOperationException("Only admins can change user status");
        }
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.INACTIVE);
            user.setActive(false);
        } else {
            user.setStatus(UserStatus.ACTIVE);
            user.setActive(true);
        }
        AppUser saved = appUserRepository.save(user);
        auditService.log(currentUser, "Updated User Status", "User", saved.getId().toString(), saved.getFullName(), "Toggled user status");
        return userMapper.toUserResponse(saved);
    }

    @Transactional
    public AuthDtos.AuthenticatedUserResponse updateProfile(UserDtos.ProfileUpdateRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        currentUser.setPhone(request.phone());
        currentUser.setBio(request.bio());
        AppUser saved = appUserRepository.save(currentUser);
        auditService.log(saved, "Updated Profile", "User", saved.getId().toString(), saved.getFullName(), "Updated profile information");
        return userMapper.toAuthenticatedUserResponse(saved, permissionService.grantsFor(saved.getRole()));
    }

    private void apply(AppUser user, UserDtos.UserUpsertRequest request) {
        user.setUsername(request.username().trim());
        user.setFullName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        user.setRole(UserRole.fromValue(request.role()));
        user.setDepartment(departmentRepository.findById(UUID.fromString(request.departmentId()))
            .orElseThrow(() -> new ResourceNotFoundException("Department not found")));
        user.setPhone(request.phone());
        user.setStatus(Boolean.TRUE.equals(request.active()) ? UserStatus.ACTIVE : UserStatus.INACTIVE);
        user.setActive(Boolean.TRUE.equals(request.active()));
    }

    private void validateUniqueUserFields(UUID currentUserId, UserDtos.UserUpsertRequest request) {
        appUserRepository.findByUsernameIgnoreCase(request.username().trim())
            .filter(existing -> currentUserId == null || !existing.getId().equals(currentUserId))
            .ifPresent(existing -> {
                throw new BadRequestException("Username is already in use");
            });
        appUserRepository.findByEmailIgnoreCase(request.email().trim())
            .filter(existing -> currentUserId == null || !existing.getId().equals(currentUserId))
            .ifPresent(existing -> {
                throw new BadRequestException("Email address is already in use");
            });
    }
}
