package com.lagiism.database.controller;

import com.lagiism.database.dto.DatabaseStatusDto;
import com.lagiism.database.dto.SqlPreviewDto;
import com.lagiism.database.service.DatabaseAdminService;
import com.lagiism.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/database")
@RequiredArgsConstructor
public class AdminDatabaseController {

    private final DatabaseAdminService databaseAdminService;

    @GetMapping("/status")
    public ApiResponse<DatabaseStatusDto> status() {
        return ApiResponse.ok(databaseAdminService.getStatus());
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(Authentication authentication) {
        byte[] dump = databaseAdminService.exportDump(authentication.getName());
        String filename = "lagiism-backup-" + LocalDate.now() + ".sql";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(dump);
    }

    @PostMapping(value = "/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SqlPreviewDto> preview(@RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(databaseAdminService.previewSql(file));
    }

    @PostMapping(value = "/restore", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> restore(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean confirmed,
            Authentication authentication
    ) {
        databaseAdminService.restoreWithRollback(file, confirmed, authentication.getName());
        return ApiResponse.ok("Database restored successfully", null);
    }
}
