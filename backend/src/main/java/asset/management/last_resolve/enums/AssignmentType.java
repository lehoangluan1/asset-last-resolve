package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AssignmentType implements ApiValueEnum {
    PERMANENT("permanent"),
    TEMPORARY("temporary"),
    BORROW("borrow");

    private final String value;

    AssignmentType(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AssignmentType fromValue(String value) {
        return EnumLookup.fromValue(AssignmentType.class, value);
    }
}
