package com.lagiism.cloudinary;

public record CloudinaryUploadResult(
        String secureUrl,
        String publicId
) {}
