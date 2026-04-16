package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DiscrepancyStatus implements ApiValueEnum {
    OPEN("open"),
    INVESTIGATING("investigating"),
    RESOLVED("resolved"),
    ESCALATED("escalated");

    private final String value;

    DiscrepancyStatus(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DiscrepancyStatus fromValue(String value) {
        return EnumLookup.fromValue(DiscrepancyStatus.class, value);
    }
}
