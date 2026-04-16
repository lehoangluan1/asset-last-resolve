package asset.management.last_resolve.mapper;

import asset.management.last_resolve.dto.AuthDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.entity.AppUser;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDtos.UserResponse toUserResponse(AppUser user) {
        return new UserDtos.UserResponse(
            MapperUtils.uuid(user.getId()),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            user.getRole().getValue(),
            MapperUtils.uuid(user.getDepartment().getId()),
            user.getDepartment().getName(),
            user.getStatus().getValue(),
            user.getAvatarUrl(),
            user.getPhone(),
            MapperUtils.timestamp(user.getCreatedAt())
        );
    }

    public AuthDtos.AuthenticatedUserResponse toAuthenticatedUserResponse(AppUser user, Set<String> grants) {
        return new AuthDtos.AuthenticatedUserResponse(
            MapperUtils.uuid(user.getId()),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            user.getRole().getValue(),
            MapperUtils.uuid(user.getDepartment().getId()),
            user.getDepartment().getName(),
            user.getStatus().getValue(),
            user.getPhone(),
            user.getAvatarUrl(),
            user.getBio(),
            MapperUtils.timestamp(user.getCreatedAt()),
            MapperUtils.timestamp(user.getLastLoginAt()),
            grants
        );
    }
}
