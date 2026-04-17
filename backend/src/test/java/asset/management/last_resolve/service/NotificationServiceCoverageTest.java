package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.NotificationDtos;
import asset.management.last_resolve.entity.AppNotification;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.NotificationType;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.mapper.NotificationMapper;
import asset.management.last_resolve.repository.AppNotificationRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceCoverageTest {

    @Mock private AppNotificationRepository notificationRepository;
    @Mock private NotificationMapper notificationMapper;

    private NotificationService service;
    private AppUser user;
    private AppNotification notification;

    @BeforeEach
    void setUp() {
        service = new NotificationService(notificationRepository, notificationMapper);
        Department department = TestDataFactory.department("IT");
        user = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        notification = new AppNotification();
        notification.setId(UUID.randomUUID());
        notification.setRecipientUser(user);
        notification.setTitle("Coverage notification");
        notification.setRead(false);
        notification.setCreatedAt(java.time.OffsetDateTime.now());
    }

    @Test
    void getNotificationsMapsRepositoryResults() {
        NotificationDtos.NotificationResponse response = new NotificationDtos.NotificationResponse(
            notification.getId().toString(),
            notification.getTitle(),
            "Message",
            NotificationType.GENERAL.getValue(),
            "Asset",
            "1",
            notification.getCreatedAt().toString(),
            false,
            "actor",
            "normal"
        );
        when(notificationRepository.findByRecipientUser_IdOrderByCreatedAtDesc(user.getId())).thenReturn(List.of(notification));
        when(notificationMapper.toResponse(notification)).thenReturn(response);

        List<NotificationDtos.NotificationResponse> result = service.getNotifications(user);

        assertThat(result).containsExactly(response);
    }

    @Test
    void markAllReadUpdatesUnreadNotifications() {
        when(notificationRepository.findByRecipientUser_IdOrderByCreatedAtDesc(user.getId())).thenReturn(List.of(notification));

        service.markAllRead(user);

        assertThat(notification.isRead()).isTrue();
        assertThat(notification.getReadAt()).isNotNull();
        verify(notificationRepository).saveAll(List.of(notification));
    }

    @Test
    void markReadOnlyUpdatesOwnedNotifications() {
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));

        service.markRead(user, notification.getId());

        assertThat(notification.isRead()).isTrue();
        verify(notificationRepository).save(notification);
    }

    @Test
    void createPersistsNewNotification() {
        service.create(user, "Created", "Message", NotificationType.GENERAL, "Asset", "123", "System", "high");

        verify(notificationRepository).save(any(AppNotification.class));
    }
}
