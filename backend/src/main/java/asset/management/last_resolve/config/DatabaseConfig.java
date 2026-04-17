package asset.management.last_resolve.config;

import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @ConfigurationProperties(prefix = "app.database")
    DatabaseProperties databaseProperties() {
        return new DatabaseProperties();
    }

    @Bean
    @ConditionalOnMissingBean(DataSource.class)
    DataSource dataSource(DatabaseProperties properties) {
        ResolvedDatabaseConnection connection = resolve(properties);
        return DataSourceBuilder.create()
            .type(HikariDataSource.class)
            .driverClassName("org.postgresql.Driver")
            .url(connection.jdbcUrl())
            .username(connection.username())
            .password(connection.password())
            .build();
    }

    static ResolvedDatabaseConnection resolve(DatabaseProperties properties) {
        String rawUrl = properties.getUrl();
        if (!StringUtils.hasText(rawUrl)) {
            throw new IllegalStateException("Database URL must not be blank");
        }

        String trimmedUrl = rawUrl.trim();
        if (trimmedUrl.startsWith("jdbc:postgresql://")) {
            return new ResolvedDatabaseConnection(
                trimmedUrl,
                valueOrEmpty(properties.getUsername()),
                valueOrEmpty(properties.getPassword())
            );
        }

        if (trimmedUrl.startsWith("postgresql://") || trimmedUrl.startsWith("postgres://")) {
            URI uri = URI.create(trimmedUrl);
            String database = uri.getPath() == null ? "" : uri.getPath().replaceFirst("^/", "");
            if (!StringUtils.hasText(database)) {
                throw new IllegalStateException("Database URL must include a database name");
            }

            String host = uri.getHost();
            if (!StringUtils.hasText(host)) {
                throw new IllegalStateException("Database URL must include a host");
            }

            StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(host);
            if (uri.getPort() > 0) {
                jdbcUrl.append(':').append(uri.getPort());
            }
            jdbcUrl.append('/').append(database);
            if (StringUtils.hasText(uri.getQuery())) {
                jdbcUrl.append('?').append(uri.getRawQuery());
            }

            String[] credentials = credentials(uri.getRawUserInfo());
            String username = StringUtils.hasText(properties.getUsername()) ? properties.getUsername().trim() : credentials[0];
            String password = StringUtils.hasText(properties.getPassword()) ? properties.getPassword() : credentials[1];
            return new ResolvedDatabaseConnection(jdbcUrl.toString(), username, password);
        }

        throw new IllegalStateException("Unsupported PostgreSQL URL format: " + trimmedUrl);
    }

    private static String[] credentials(String rawUserInfo) {
        if (!StringUtils.hasText(rawUserInfo)) {
            return new String[] { "", "" };
        }

        String[] parts = rawUserInfo.split(":", 2);
        String username = decode(parts[0]);
        String password = parts.length > 1 ? decode(parts[1]) : "";
        return new String[] { username, password };
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String valueOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    public static final class DatabaseProperties {

        private String url;
        private String username;
        private String password;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    record ResolvedDatabaseConnection(String jdbcUrl, String username, String password) {
    }
}
