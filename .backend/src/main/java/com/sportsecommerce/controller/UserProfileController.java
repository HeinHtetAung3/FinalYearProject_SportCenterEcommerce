package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.service.ProfileService;
import com.sportsecommerce.service.UserContextResolver;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final ProfileService profileService;
    private final UserContextResolver userContextResolver;

    public UserProfileController(ProfileService profileService, UserContextResolver userContextResolver) {
        this.profileService = profileService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping("/profile")
    public ResponseEntity<CommerceDtos.ProfileResponse> getProfile() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(profileService.get(email));
    }

    @PostMapping(value = "/upload-profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommerceDtos.ProfileImageResponse> uploadProfileImage(@RequestParam("image") MultipartFile image) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(profileService.uploadProfileImage(email, image));
    }

    @PutMapping(value = "/update-profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommerceDtos.ProfileImageResponse> updateProfileImage(@RequestParam("image") MultipartFile image) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(profileService.updateProfileImage(email, image));
    }

    @DeleteMapping("/profile-image")
    public ResponseEntity<CommerceDtos.ProfileImageResponse> deleteProfileImage() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(profileService.deleteProfileImage(email));
    }
}
