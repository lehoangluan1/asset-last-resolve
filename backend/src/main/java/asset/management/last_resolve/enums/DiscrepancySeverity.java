package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DiscrepancySeverity implements ApiValueEnum {
    LOW("low"),
    MEDIUM("medium"),
    HIGH("high"),
    CRITICAL("critical");

    private final String value;

    DiscrepancySeverity(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DiscrepancySeverity fromValue(String value) {
        return EnumLookup.fromValue(DiscrepancySeverity.class, value);
    }
}
