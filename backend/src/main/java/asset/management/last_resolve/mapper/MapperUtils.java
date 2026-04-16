package asset.management.last_resolve.mapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public final class MapperUtils {

    private MapperUtils() {
    }

    public static String uuid(UUID value) {
        return value == null ? null : value.toString();
    }

    public static String date(LocalDate value) {
        return value == null ? null : value.toString();
    }

    public static String timestamp(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    public static Double decimal(BigDecimal value) {
        return value == null ? null : value.doubleValue();
    }
}
