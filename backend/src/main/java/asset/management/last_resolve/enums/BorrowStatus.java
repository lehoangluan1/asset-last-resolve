package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum BorrowStatus implements ApiValueEnum {
    DRAFT("draft"),
    PENDING_APPROVAL("pending-approval"),
    APPROVED("approved"),
    REJECTED("rejected"),
    CHECKED_OUT("checked-out"),
    RETURNED("returned"),
    OVERDUE("overdue"),
    CANCELLED("cancelled");

    private final String value;

    BorrowStatus(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static BorrowStatus fromValue(String value) {
        return EnumLookup.fromValue(BorrowStatus.class, value);
    }
}
