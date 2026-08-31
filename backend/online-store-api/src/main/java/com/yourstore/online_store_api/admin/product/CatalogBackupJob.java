package com.yourstore.online_store_api.admin.product;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Nightly catalog CSV while the API is running. Disabled when {@code app.backup.catalog-dir} is blank.
 * Readable snapshot only — do not treat this as disaster recovery. Use {@code deploy/scripts/backup-all.sh}
 * (Postgres dump + local MinIO volume). Prod images already live on R2.
 */
@Component
public class CatalogBackupJob {

    private static final Logger log = LoggerFactory.getLogger(CatalogBackupJob.class);
    private static final DateTimeFormatter FILE_STAMP =
            DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final AdminProductService adminProductService;
    private final String catalogDir;
    private final int keepDays;

    CatalogBackupJob(
            AdminProductService adminProductService,
            @Value("${app.backup.catalog-dir:}") String catalogDir,
            @Value("${app.backup.keep-days:14}") int keepDays) {
        this.adminProductService = adminProductService;
        this.catalogDir = catalogDir;
        this.keepDays = keepDays;
    }

    @Scheduled(cron = "${app.backup.catalog-cron:0 0 3 * * *}")
    public void writeCatalogCsv() {
        if (catalogDir == null || catalogDir.isBlank()) {
            return;
        }
        Path folder = Path.of(catalogDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(folder);
            String filename = "catalog-" + FILE_STAMP.format(LocalDateTime.now()) + ".csv";
            Path target = folder.resolve(filename);
            Files.writeString(target, adminProductService.exportCatalogCsv(), StandardCharsets.UTF_8);
            pruneOldCsv(folder);
            log.info("Wrote catalog backup {}", target);
        } catch (IOException ex) {
            log.error("Catalog backup failed: {}", ex.getMessage());
        }
    }

    private void pruneOldCsv(Path folder) throws IOException {
        if (keepDays <= 0) {
            return;
        }
        Instant cutoff = Instant.now().minus(keepDays, ChronoUnit.DAYS);
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(folder, "catalog-*.csv")) {
            for (Path file : stream) {
                Instant modified = Files.getLastModifiedTime(file).toInstant();
                if (modified.isBefore(cutoff)) {
                    Files.deleteIfExists(file);
                    log.info("Removed old catalog backup {}", file.getFileName());
                }
            }
        }
    }
}
