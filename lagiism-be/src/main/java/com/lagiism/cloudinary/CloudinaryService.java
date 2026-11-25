package com.lagiism.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lagiism.shared.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Safe Cloudinary media service:
 * Always uploads the new asset first and deletes oldPublicId only after
 * the new upload succeeds.
 */
@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;
    private final boolean configured;

    public CloudinaryService(
            @Value("${app.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.cloudinary.api-key:}") String apiKey,
            @Value("${app.cloudinary.api-secret:}") String apiSecret
    ) {
        this.configured = !cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank();
        if (this.configured) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
        } else {
            this.cloudinary = null;
        }
    }

    public CloudinaryUploadResult upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file must not be empty");
        }
        if (!configured) {
            throw new BadRequestException("Cloudinary is not configured in environment variables");
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "lagiism/" + (folder != null ? folder : "uploads"),
                            "resource_type", "image"
                    )
            );
            String secureUrl = String.valueOf(result.get("secure_url"));
            String publicId = String.valueOf(result.get("public_id"));
            return new CloudinaryUploadResult(secureUrl, publicId);
        } catch (IOException e) {
            log.error("Cloudinary upload failed", e);
            throw new BadRequestException("Failed to upload image to Cloudinary");
        }
    }

    public CloudinaryUploadResult replace(MultipartFile newFile, String folder, String oldPublicId) {
        CloudinaryUploadResult uploaded = upload(newFile, folder);
        if (oldPublicId != null && !oldPublicId.isBlank() && !oldPublicId.equals(uploaded.publicId())) {
            deleteQuietly(oldPublicId);
        }
        return uploaded;
    }

    public void deleteQuietly(String publicId) {
        if (!configured || publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            log.warn("Failed to delete old Cloudinary asset {}: {}", publicId, e.getMessage());
        }
    }
}
