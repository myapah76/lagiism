package com.lagiism.database.service;

import com.lagiism.account.service.AuditLogService;
import com.lagiism.database.dto.DatabaseStatusDto;
import com.lagiism.database.dto.SqlPreviewDto;
import com.lagiism.shared.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DatabaseAdminService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseAdminService.class);
    private static final List<String> MONITORED_TABLES = List.of(
            "users",
            "roles",
            "user_roles",
            "admin_audit_logs",
            "categories",
            "products",
            "cms_heroes",
            "cms_sections",
            "cms_reviews",
            "site_settings"
    );

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;
    private final AuditLogService auditLogService;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:}")
    private String datasourcePassword;

    public DatabaseStatusDto getStatus() {
        String product = "Unknown";
        String version = "Unknown";
        boolean healthy = false;
        Map<String, Long> counts = new LinkedHashMap<>();

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            product = meta.getDatabaseProductName();
            version = meta.getDatabaseProductVersion();
            healthy = conn.isValid(5);
        } catch (Exception e) {
            log.error("Failed to inspect database metadata", e);
        }

        for (String table : MONITORED_TABLES) {
            try {
                Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
                counts.put(table, count != null ? count : 0L);
            } catch (Exception e) {
                counts.put(table, -1L);
            }
        }

        return new DatabaseStatusDto(product, version, healthy, counts);
    }

    public byte[] exportDump(String actorEmail) {
        if (!datasourceUrl.startsWith("jdbc:postgresql://")) {
            throw new BadRequestException("pg_dump export is only supported on PostgreSQL databases");
        }
        PgConnectionInfo info = parsePostgresUrl(datasourceUrl);

        ProcessBuilder pb = new ProcessBuilder(
                "pg_dump",
                "-h", info.host(),
                "-p", String.valueOf(info.port()),
                "-U", datasourceUsername,
                "-d", info.database(),
                "--clean",
                "--if-exists",
                "--no-owner"
        );
        pb.environment().put("PGPASSWORD", datasourcePassword);
        pb.redirectErrorStream(false);

        try {
            Process process = pb.start();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            process.getInputStream().transferTo(out);
            String stderr = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.error("pg_dump failed with exit {}: {}", exitCode, stderr);
                throw new BadRequestException("pg_dump failed: " + stderr);
            }
            auditLogService.record(actorEmail, "DB_EXPORT", "DATABASE", info.database(), "Exported SQL dump");
            return out.toByteArray();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Database export interrupted");
        } catch (IOException e) {
            throw new BadRequestException("pg_dump binary is not available on this host");
        }
    }

    public SqlPreviewDto previewSql(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("SQL file must not be empty");
        }
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            List<String> lines = content.lines().toList();
            String upper = content.toUpperCase(Locale.ROOT);
            boolean destructive = upper.contains("DROP TABLE") || upper.contains("TRUNCATE ") || upper.contains("DROP SCHEMA");
            int statements = (int) Arrays.stream(content.split(";"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty() && !s.startsWith("--"))
                    .count();
            List<String> sample = lines.stream().limit(25).toList();
            return new SqlPreviewDto(lines.size(), statements, destructive, sample);
        } catch (IOException e) {
            throw new BadRequestException("Unable to read SQL file");
        }
    }

    public void restoreWithRollback(MultipartFile file, boolean confirmed, String actorEmail) {
        if (!confirmed) {
            throw new BadRequestException("Restore requires explicit confirmation flag (confirmed=true)");
        }
        if (!datasourceUrl.startsWith("jdbc:postgresql://")) {
            throw new BadRequestException("SQL restore via psql is only supported on PostgreSQL databases");
        }
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("SQL dump file is required");
        }

        PgConnectionInfo info = parsePostgresUrl(datasourceUrl);
        ProcessBuilder pb = new ProcessBuilder(
                "psql",
                "-h", info.host(),
                "-p", String.valueOf(info.port()),
                "-U", datasourceUsername,
                "-d", info.database(),
                "--single-transaction",
                "-v", "ON_ERROR_STOP=1"
        );
        pb.environment().put("PGPASSWORD", datasourcePassword);

        try {
            Process process = pb.start();
            process.getOutputStream().write(file.getBytes());
            process.getOutputStream().flush();
            process.getOutputStream().close();

            String stderr = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.error("Database restore failed and rolled back: {}", stderr);
                throw new BadRequestException("Restore failed and was rolled back: " + stderr);
            }
            auditLogService.record(actorEmail, "DB_RESTORE", "DATABASE", info.database(),
                    "Restored SQL dump (" + file.getOriginalFilename() + ") with transactional rollback protection");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Database restore interrupted");
        } catch (IOException e) {
            throw new BadRequestException("psql binary is not available on this host");
        }
    }

    private PgConnectionInfo parsePostgresUrl(String jdbcUrl) {
        URI uri = URI.create(jdbcUrl.substring("jdbc:".length()));
        String host = uri.getHost() != null ? uri.getHost() : "localhost";
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getPath();
        String db = (path != null && path.startsWith("/")) ? path.substring(1) : "lagiism";
        return new PgConnectionInfo(host, port, db);
    }

    private record PgConnectionInfo(String host, int port, String database) {}
}
