package com.lagiism.catalog.repository;

import com.lagiism.catalog.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByActiveTrueOrderBySortOrderAsc();
    List<Product> findAllByActiveTrueAndCategoryCodeIgnoreCaseOrderBySortOrderAsc(String categoryCode);
    List<Product> findAllByOrderBySortOrderAsc();
    Optional<Product> findBySlugIgnoreCase(String slug);
}
