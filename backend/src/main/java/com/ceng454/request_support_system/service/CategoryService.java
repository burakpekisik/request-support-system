package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.model.Category;
import com.ceng454.request_support_system.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public void addCategory(String name) {
        // İleride aynı isimde kategori var mı diye kontrol eklenebilir.
        categoryRepository.add(name);
    }

    public void updateCategory(Integer id, String name) {
        categoryRepository.update(id, name);
    }

    public void deleteCategory(Integer id) {
        // Soft delete
        categoryRepository.setActivity(id, false);
    }
    
    public void activateCategory(Integer id) {
        // Aktif etme
        categoryRepository.setActivity(id, true);
    }
}
