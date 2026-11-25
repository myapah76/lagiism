package com.lagiism.cloudinary;

import com.lagiism.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CloudinaryUploadResult> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "general") String folder,
            @RequestParam(required = false) String oldPublicId
    ) {
        CloudinaryUploadResult result = (oldPublicId != null && !oldPublicId.isBlank())
                ? cloudinaryService.replace(file, folder, oldPublicId)
                : cloudinaryService.upload(file, folder);
        return ApiResponse.ok("Image uploaded", result);
    }
}
