package asset.management.last_resolve.service;

import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.security.AuthenticatedUser;
import asset.management.last_resolve.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final AppUserRepository appUserRepository;

    public AuthenticatedUser currentPrincipal() {
        return SecurityUtils.currentUser();
    }

    public AppUser currentUser() {
        return appUserRepository.findById(currentPrincipal().getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
