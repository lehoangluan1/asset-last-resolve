package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CampaignStatus implements ApiValueEnum {
    DRAFT("draft"),
    ACTIVE("active"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    CampaignStatus(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static CampaignStatus fromValue(String value) {
        return EnumLookup.fromValue(CampaignStatus.class, value);
    }
}
