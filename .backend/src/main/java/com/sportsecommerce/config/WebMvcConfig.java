package com.sportsecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuditLoggingInterceptor auditLoggingInterceptor;
    private final String profileUploadDir;

    public WebMvcConfig(
            AuditLoggingInterceptor auditLoggingInterceptor,
            @Value("${app.upload.profile-dir:uploads/profile}") String profileUploadDir
    ) {
        this.auditLoggingInterceptor = auditLoggingInterceptor;
        this.profileUploadDir = profileUploadDir;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auditLoggingInterceptor).addPathPatterns("/api/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path absoluteUploadPath = Paths.get(profileUploadDir).toAbsolutePath().normalize();
        String resourceLocation = absoluteUploadPath.toUri().toString();
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations(resourceLocation.endsWith("/") ? resourceLocation : resourceLocation + "/");
    }
}
