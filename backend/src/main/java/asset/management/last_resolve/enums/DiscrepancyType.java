package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DiscrepancyType implements ApiValueEnum {
    LOCATION("location"),
    CONDITION("condition"),
    ASSIGNEE("assignee"),
    MISSING("missing"),
    OTHER("other");

    private final String value;

    DiscrepancyType(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DiscrepancyType fromValue(String value) {
        return EnumLookup.fromValue(DiscrepancyType.class, value);
    }
}
