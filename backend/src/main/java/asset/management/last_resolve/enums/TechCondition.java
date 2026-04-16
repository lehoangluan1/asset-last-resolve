package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TechCondition implements ApiValueEnum {
    GOOD("good"),
    NEEDS_MONITORING("needs-monitoring"),
    UNDER_REPAIR("under-repair"),
    NOT_READY("not-ready");

    private final String value;

    TechCondition(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TechCondition fromValue(String value) {
        return EnumLookup.fromValue(TechCondition.class, value);
    }
}
