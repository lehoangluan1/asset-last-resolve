package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationType implements ApiValueEnum {
    BORROW_PENDING("borrow-pending"),
    BORROW_APPROVED("borrow-approved"),
    BORROW_REJECTED("borrow-rejected"),
    ASSET_OVERDUE("asset-overdue"),
    VERIFICATION_DUE("verification-due"),
    VERIFICATION_ASSIGNED("verification-assigned"),
    DISCREPANCY_CREATED("discrepancy-created"),
    MAINTENANCE_COMPLETED("maintenance-completed"),
    DISPOSAL_REVIEW("disposal-review"),
    USER_CREATED("user-created"),
    ASSET_TRANSFERRED("asset-transferred"),
    GENERAL("general");

    private final String value;

    NotificationType(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static NotificationType fromValue(String value) {
        return EnumLookup.fromValue(NotificationType.class, value);
    }
}
