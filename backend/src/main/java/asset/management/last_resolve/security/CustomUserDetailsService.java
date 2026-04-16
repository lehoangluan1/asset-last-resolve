package asset.management.last_resolve.security;

import asset.management.last_resolve.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AppUserRepository appUserRepository;
    private final PermissionService permissionService;

    @Override
    public UserDetails loadUserByUsername(String username) {
        return appUserRepository.findByUsernameIgnoreCase(username)
            .map(user -> new AuthenticatedUser(user, permissionService.grantsFor(user.getRole())))
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
