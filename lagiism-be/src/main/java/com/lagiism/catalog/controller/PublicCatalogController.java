package com.lagiism.catalog.controller;

import com.lagiism.catalog.dto.CategoryDto;
import com.lagiism.catalog.dto.ProductDto;
import com.lagiism.catalog.service.CatalogService;
import com.lagiism.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/catalog")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final CatalogService catalogService;

    @GetMapping("/products")
    public ApiResponse<List<ProductDto>> listProducts(@RequestParam(required = false) String category) {
        return ApiResponse.ok(catalogService.listPublicProducts(category));
    }

    @GetMapping("/products/{slug}")
    public ApiResponse<ProductDto> getProduct(@PathVariable String slug) {
        return ApiResponse.ok(catalogService.getPublicProductBySlug(slug));
    }

    @GetMapping("/categories")
    public ApiResponse<List<CategoryDto>> listCategories() {
        return ApiResponse.ok(catalogService.listPublicCategories());
    }
}
