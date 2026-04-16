package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.AuthDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.UserMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.security.AuthenticatedUser;
import asset.management.last_resolve.security.JwtProperties;
import asset.management.last_resolve.security.JwtService;
import asset.management.last_resolve.security.PermissionService;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final UserMapper userMapper;
    private final PermissionService permissionService;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        AuthenticatedUser principal = (AuthenticatedUser) authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        ).getPrincipal();

        AppUser user = appUserRepository.findById(principal.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        user.setLastLoginAt(OffsetDateTime.now());
        appUserRepository.save(user);

        String token = jwtService.generateToken(principal);
        OffsetDateTime expiresAt = OffsetDateTime.now().plusSeconds(jwtProperties.expirationSeconds());
        return new AuthDtos.AuthResponse(
            token,
            expiresAt,
            userMapper.toAuthenticatedUserResponse(user, permissionService.grantsFor(user.getRole()))
        );
    }

    @Transactional(readOnly = true)
    public AuthDtos.AuthenticatedUserResponse me() {
        AppUser user = currentUserService.currentUser();
        return userMapper.toAuthenticatedUserResponse(user, permissionService.grantsFor(user.getRole()));
    }

    @Transactional
    public void changePassword(AuthDtos.ChangePasswordRequest request) {
        AppUser user = currentUserService.currentUser();
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        appUserRepository.save(user);
    }
}
