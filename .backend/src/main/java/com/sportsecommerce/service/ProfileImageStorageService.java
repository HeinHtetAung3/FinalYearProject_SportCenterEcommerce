package com.sportsecommerce.service;

import org.springframework.web.multipart.MultipartFile;

public interface ProfileImageStorageService {
    String store(MultipartFile image);

    void deleteByPublicUrl(String publicUrl);
}
