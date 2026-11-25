package com.lagiism.catalog.controller;

import com.lagiism.catalog.dto.*;
import com.lagiism.catalog.service.CatalogService;
import com.lagiism.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/catalog")
@RequiredArgsConstructor
public class AdminCatalogController {

    private final CatalogService catalogService;

    @GetMapping("/products")
    public ApiResponse<List<ProductDto>> listProducts() {
        return ApiResponse.ok(catalogService.listAllProductsAdmin());
    }

    @PostMapping("/products")
    public ApiResponse<ProductDto> createProduct(@Valid @RequestBody SaveProductRequest request,
                                                 Authentication authentication) {
        return ApiResponse.ok("Product created", catalogService.saveProduct(null, request, authentication.getName()));
    }

    @PutMapping("/products/{id}")
    public ApiResponse<ProductDto> updateProduct(@PathVariable Long id,
                                                 @Valid @RequestBody SaveProductRequest request,
                                                 Authentication authentication) {
        return ApiResponse.ok("Product updated", catalogService.saveProduct(id, request, authentication.getName()));
    }

    @DeleteMapping("/products/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id, Authentication authentication) {
        catalogService.deleteProduct(id, authentication.getName());
        return ApiResponse.ok("Product deleted", null);
    }

    @GetMapping("/categories")
    public ApiResponse<List<CategoryDto>> listCategories() {
        return ApiResponse.ok(catalogService.listAllCategoriesAdmin());
    }

    @PostMapping("/categories")
    public ApiResponse<CategoryDto> createCategory(@Valid @RequestBody SaveCategoryRequest request,
                                                   Authentication authentication) {
        return ApiResponse.ok("Category created", catalogService.saveCategory(null, request, authentication.getName()));
    }

    @PutMapping("/categories/{id}")
    public ApiResponse<CategoryDto> updateCategory(@PathVariable Long id,
                                                   @Valid @RequestBody SaveCategoryRequest request,
                                                   Authentication authentication) {
        return ApiResponse.ok("Category updated", catalogService.saveCategory(id, request, authentication.getName()));
    }

    @DeleteMapping("/categories/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id, Authentication authentication) {
        catalogService.deleteCategory(id, authentication.getName());
        return ApiResponse.ok("Category deleted", null);
    }
}
