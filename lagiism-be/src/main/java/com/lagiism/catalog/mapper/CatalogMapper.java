package com.lagiism.catalog.mapper;

import com.lagiism.catalog.dto.CategoryDto;
import com.lagiism.catalog.dto.ProductDto;
import com.lagiism.catalog.dto.SaveCategoryRequest;
import com.lagiism.catalog.dto.SaveProductRequest;
import com.lagiism.catalog.entity.Category;
import com.lagiism.catalog.entity.Product;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class CatalogMapper {

    public ProductDto toProductDto(Product p) {
        List<String> sizeList = Arrays.stream((p.getSizesCsv() != null ? p.getSizesCsv() : "S,M,L,XL").split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        return new ProductDto(
                p.getId(),
                p.getSlug(),
                p.getSku(),
                p.getName(),
                p.getNameVi(),
                p.getPriceVnd(),
                p.getCategoryCode(),
                p.getSetSlot(),
                p.getColorName(),
                p.getColorHex(),
                sizeList,
                p.getImageUrl(),
                p.getImagePublicId(),
                p.getSecondaryImageUrl(),
                p.getSecondaryImagePublicId(),
                p.getGlbModelSlot(),
                p.getDescription(),
                p.getGsm(),
                p.getFabric(),
                p.getFit(),
                p.getOrigin(),
                p.getCoordinates(),
                p.getBadgeText(),
                p.isActive(),
                p.getSortOrder()
        );
    }

    public void applyProductRequest(Product product, SaveProductRequest req) {
        product.setSlug(req.slug().trim().toLowerCase());
        product.setSku(req.sku().trim().toUpperCase());
        product.setName(req.name().trim());
        product.setNameVi(req.nameVi());
        product.setPriceVnd(req.priceVnd());
        product.setCategoryCode(req.categoryCode().trim().toUpperCase());
        product.setSetSlot(req.setSlot().trim().toUpperCase());
        product.setColorName(req.colorName().trim());
        product.setColorHex(req.colorHex().trim());
        product.setSizesCsv((req.sizes() != null && !req.sizes().isEmpty())
                ? String.join(",", req.sizes())
                : "S,M,L,XL");
        product.setImageUrl(req.imageUrl().trim());
        product.setImagePublicId(req.imagePublicId());
        product.setSecondaryImageUrl(req.secondaryImageUrl());
        product.setSecondaryImagePublicId(req.secondaryImagePublicId());
        product.setGlbModelSlot(req.glbModelSlot());
        product.setDescription(req.description());
        product.setGsm(req.gsm());
        product.setFabric(req.fabric());
        product.setFit(req.fit());
        product.setOrigin(req.origin());
        product.setCoordinates(req.coordinates());
        product.setBadgeText(req.badgeText());
        product.setActive(req.active());
        product.setSortOrder(req.sortOrder());
    }

    public CategoryDto toCategoryDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getCode(),
                category.getTitle(),
                category.getSubtitle(),
                category.getImageUrl(),
                category.getImagePublicId(),
                category.getSortOrder(),
                category.isActive()
        );
    }

    public void applyCategoryRequest(Category category, SaveCategoryRequest req) {
        category.setCode(req.code().trim().toUpperCase());
        category.setTitle(req.title().trim());
        category.setSubtitle(req.subtitle());
        category.setImageUrl(req.imageUrl());
        category.setImagePublicId(req.imagePublicId());
        category.setSortOrder(req.sortOrder());
        category.setActive(req.active());
    }
}
