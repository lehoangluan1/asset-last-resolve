package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.NotificationDtos;
import asset.management.last_resolve.service.CurrentUserService;
import asset.management.last_resolve.service.NotificationService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAuthority('notifications.read')")
    public ResponseEntity<List<NotificationDtos.NotificationResponse>> list() {
        return ResponseEntity.ok(notificationService.getNotifications(currentUserService.currentUser()));
    }

    @PostMapping("/read-all")
    @PreAuthorize("hasAuthority('notifications.read')")
    public ResponseEntity<Void> readAll() {
        notificationService.markAllRead(currentUserService.currentUser());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{notificationId}/read")
    @PreAuthorize("hasAuthority('notifications.read')")
    public ResponseEntity<Void> read(@PathVariable UUID notificationId) {
        notificationService.markRead(currentUserService.currentUser(), notificationId);
        return ResponseEntity.noContent().build();
    }
}
