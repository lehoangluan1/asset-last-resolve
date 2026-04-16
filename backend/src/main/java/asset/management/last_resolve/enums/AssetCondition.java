package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AssetCondition implements ApiValueEnum {
    EXCELLENT("excellent"),
    GOOD("good"),
    FAIR("fair"),
    POOR("poor"),
    NON_FUNCTIONAL("non-functional");

    private final String value;

    AssetCondition(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AssetCondition fromValue(String value) {
        return EnumLookup.fromValue(AssetCondition.class, value);
    }
}
