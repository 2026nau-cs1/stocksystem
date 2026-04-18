package com.stockpulse.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class DatabaseConfig {

    private final Environment environment;

    public DatabaseConfig(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    void validate() {
        if (environment.getProperty("DATABASE_URL") == null || environment.getProperty("DATABASE_URL").isBlank()) {
            throw new IllegalStateException("DATABASE_URL is required");
        }
    }

    @Bean
    DataSource dataSource() throws URISyntaxException {
        String databaseUrl = Objects.requireNonNull(environment.getProperty("DATABASE_URL"));
        URI uri = new URI(databaseUrl);
        String[] credentials = uri.getUserInfo().split(":", 2);

        StringBuilder jdbc = new StringBuilder("jdbc:postgresql://")
                .append(uri.getHost())
                .append(':')
                .append(uri.getPort())
                .append(uri.getPath());
        if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
            jdbc.append('?').append(uri.getQuery());
        } else if (!databaseUrl.contains("sslmode=") && !"disable".equalsIgnoreCase(environment.getProperty("DB_SSL"))) {
            jdbc.append("?sslmode=require");
        }

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbc.toString());
        dataSource.setUsername(decode(credentials[0]));
        dataSource.setPassword(credentials.length > 1 ? decode(credentials[1]) : "");

        if (usesTransactionPooler(uri)) {
            // Supabase/pgBouncer transaction pooling is not compatible with PostgreSQL
            // server-side prepared statements. Disable them to avoid "S_1 already exists".
            dataSource.addDataSourceProperty("prepareThreshold", "0");
            dataSource.addDataSourceProperty("preparedStatementCacheQueries", "0");
            dataSource.addDataSourceProperty("preparedStatementCacheSizeMiB", "0");
        }

        return dataSource;
    }

    private boolean usesTransactionPooler(URI uri) {
        String host = uri.getHost();
        int port = uri.getPort();

        return (host != null && host.contains("pooler.supabase.com")) || port == 6543;
    }

    private String decode(String value) {
        return java.net.URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
