package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum BorrowTargetType implements ApiValueEnum {
    INDIVIDUAL("individual"),
    DEPARTMENT("department");

    private final String value;

    BorrowTargetType(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static BorrowTargetType fromValue(String value) {
        return EnumLookup.fromValue(BorrowTargetType.class, value);
    }
}
