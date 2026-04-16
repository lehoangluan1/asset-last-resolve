package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MaintenanceStatus implements ApiValueEnum {
    SCHEDULED("scheduled"),
    IN_PROGRESS("in-progress"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    MaintenanceStatus(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static MaintenanceStatus fromValue(String value) {
        return EnumLookup.fromValue(MaintenanceStatus.class, value);
    }
}
