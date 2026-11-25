package com.lagiism.catalog.service;

import com.lagiism.account.service.AuditLogService;
import com.lagiism.catalog.dto.*;
import com.lagiism.catalog.entity.Category;
import com.lagiism.catalog.entity.Product;
import com.lagiism.catalog.mapper.CatalogMapper;
import com.lagiism.catalog.repository.CategoryRepository;
import com.lagiism.catalog.repository.ProductRepository;
import com.lagiism.cloudinary.CloudinaryService;
import com.lagiism.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;
    private final AuditLogService auditLogService;
    private final CatalogMapper catalogMapper;

    @Transactional(readOnly = true)
    public List<ProductDto> listPublicProducts(String categoryCode) {
        List<Product> products = (categoryCode != null && !categoryCode.isBlank() && !categoryCode.equalsIgnoreCase("ALL"))
                ? productRepository.findAllByActiveTrueAndCategoryCodeIgnoreCaseOrderBySortOrderAsc(categoryCode.trim())
                : productRepository.findAllByActiveTrueOrderBySortOrderAsc();
        return products.stream().map(catalogMapper::toProductDto).toList();
    }

    @Transactional(readOnly = true)
    public ProductDto getPublicProductBySlug(String slug) {
        return productRepository.findBySlugIgnoreCase(slug)
                .filter(Product::isActive)
                .map(catalogMapper::toProductDto)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + slug));
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> listPublicCategories() {
        return categoryRepository.findAllByActiveTrueOrderBySortOrderAsc().stream()
                .map(catalogMapper::toCategoryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> listAllProductsAdmin() {
        return productRepository.findAllByOrderBySortOrderAsc().stream()
                .map(catalogMapper::toProductDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> listAllCategoriesAdmin() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(catalogMapper::toCategoryDto)
                .toList();
    }

    @Transactional
    public ProductDto saveProduct(Long id, SaveProductRequest req, String actorEmail) {
        Product product = (id != null)
                ? productRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id))
                : new Product();

        catalogMapper.applyProductRequest(product, req);

        Product saved = productRepository.save(product);
        auditLogService.record(actorEmail, id == null ? "PRODUCT_CREATED" : "PRODUCT_UPDATED",
                "PRODUCT", String.valueOf(saved.getId()), "Saved product " + saved.getSku());
        return catalogMapper.toProductDto(saved);
    }

    @Transactional
    public void deleteProduct(Long id, String actorEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        String primaryPubId = product.getImagePublicId();
        String secondaryPubId = product.getSecondaryImagePublicId();
        productRepository.delete(product);
        cloudinaryService.deleteQuietly(primaryPubId);
        cloudinaryService.deleteQuietly(secondaryPubId);
        auditLogService.record(actorEmail, "PRODUCT_DELETED", "PRODUCT", String.valueOf(id),
                "Deleted product " + product.getSku());
    }

    @Transactional
    public CategoryDto saveCategory(Long id, SaveCategoryRequest req, String actorEmail) {
        Category category = (id != null)
                ? categoryRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id))
                : new Category();

        catalogMapper.applyCategoryRequest(category, req);

        Category saved = categoryRepository.save(category);
        auditLogService.record(actorEmail, id == null ? "CATEGORY_CREATED" : "CATEGORY_UPDATED",
                "CATEGORY", String.valueOf(saved.getId()), "Saved category " + saved.getCode());
        return catalogMapper.toCategoryDto(saved);
    }

    @Transactional
    public void deleteCategory(Long id, String actorEmail) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        String pubId = category.getImagePublicId();
        categoryRepository.delete(category);
        cloudinaryService.deleteQuietly(pubId);
        auditLogService.record(actorEmail, "CATEGORY_DELETED", "CATEGORY", String.valueOf(id),
                "Deleted category " + category.getCode());
    }
}
