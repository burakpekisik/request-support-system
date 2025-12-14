package com.ceng454.request_support_system.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration
 * Statik dosyaların (avatarlar, ekler) servis edilmesi için
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Avatar dosyaları için
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations("file:uploads/avatars/");

        // Attachment dosyaları için
        registry.addResourceHandler("/uploads/attachments/**")
                .addResourceLocations("file:uploads/attachments/");
    }
}
