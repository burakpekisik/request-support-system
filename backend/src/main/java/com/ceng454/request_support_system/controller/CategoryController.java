package com.ceng454.request_support_system.controller;

import com.ceng454.request_support_system.model.Category;
import com.ceng454.request_support_system.service.CategoryService;

import io.swagger.v3.oas.models.security.SecurityScheme.In;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    public ResponseEntity<Void> addCategory(@RequestBody Map<String, String> payload) {
        categoryService.addCategory(payload.get("name"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCategory(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        categoryService.updateCategory(id, payload.get("name"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateCategory(@PathVariable Integer id) {
        categoryService.activateCategory(id);
        return ResponseEntity.ok().build();
    }
}
