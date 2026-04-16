package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReferenceStatus implements ApiValueEnum {
    ACTIVE("active"),
    INACTIVE("inactive");

    private final String value;

    ReferenceStatus(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ReferenceStatus fromValue(String value) {
        return EnumLookup.fromValue(ReferenceStatus.class, value);
    }
}
