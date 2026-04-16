package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LifecycleStatus implements ApiValueEnum {
    IN_USE("in-use"),
    IN_STORAGE("in-storage"),
    UNDER_MAINTENANCE("under-maintenance"),
    PENDING_DISPOSAL("pending-disposal"),
    DISPOSED("disposed"),
    BORROWED("borrowed");

    private final String value;

    LifecycleStatus(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LifecycleStatus fromValue(String value) {
        return EnumLookup.fromValue(LifecycleStatus.class, value);
    }
}
