package asset.management.last_resolve.security;

import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.enums.UserStatus;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class AuthenticatedUser implements UserDetails {

    private final UUID userId;
    private final UUID departmentId;
    private final String name;
    private final String username;
    private final String password;
    private final UserRole role;
    private final boolean active;
    private final Set<GrantedAuthority> authorities;

    public AuthenticatedUser(AppUser user, Set<String> grants) {
        this.userId = user.getId();
        this.departmentId = user.getDepartment().getId();
        this.name = user.getFullName();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.role = user.getRole();
        this.active = user.isActive() && user.getStatus() == UserStatus.ACTIVE;
        this.authorities = grants.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        this.authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    public boolean hasGrant(String grant) {
        return authorities.stream().anyMatch(authority -> authority.getAuthority().equals(grant));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
