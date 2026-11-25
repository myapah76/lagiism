package com.lagiism.catalog.repository;

import com.lagiism.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByActiveTrueOrderBySortOrderAsc();
    List<Category> findAllByOrderBySortOrderAsc();
    Optional<Category> findByCodeIgnoreCase(String code);
}
