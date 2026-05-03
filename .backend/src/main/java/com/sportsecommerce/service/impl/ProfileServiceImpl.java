package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.entity.UserAddressEntity;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.UserAddressJpaRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.service.ProfileImageStorageService;
import com.sportsecommerce.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Service
public class ProfileServiceImpl implements ProfileService {

    private static final long MAX_IMAGE_SIZE_BYTES = 2L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png");

    private final PasswordEncoder passwordEncoder;
    private final UserJpaRepository userJpaRepository;
    private final UserAddressJpaRepository userAddressJpaRepository;
    private final ProfileImageStorageService profileImageStorageService;

    public ProfileServiceImpl(
            PasswordEncoder passwordEncoder,
            UserJpaRepository userJpaRepository,
            UserAddressJpaRepository userAddressJpaRepository,
            ProfileImageStorageService profileImageStorageService
    ) {
        this.passwordEncoder = passwordEncoder;
        this.userJpaRepository = userJpaRepository;
        this.userAddressJpaRepository = userAddressJpaRepository;
        this.profileImageStorageService = profileImageStorageService;
    }

    @Override
    public CommerceDtos.ProfileResponse get(String email) {
        UserEntity user = findUser(email);
        return toResponse(user);
    }

    @Override
    @Transactional
    public CommerceDtos.ProfileResponse update(String email, CommerceDtos.UpdateProfileRequest request) {
        UserEntity user = findUser(email);
        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());
        user.setMarketingEmailOptIn(request.marketingEmailOptIn());
        return toResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, CommerceDtos.ChangePasswordRequest request) {
        UserEntity user = findUser(email);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    @Override
    @Transactional
    public CommerceDtos.AddressResponse addAddress(String email, CommerceDtos.UpsertAddressRequest request) {
        UserEntity user = findUser(email);
        long existing = userAddressJpaRepository.countByUser_Id(user.getId());
        boolean makeDefault = Boolean.TRUE.equals(request.makeDefault()) || existing == 0;

        UserAddressEntity entity = new UserAddressEntity();
        entity.setUser(user);
        applyUpsert(entity, request);

        if (makeDefault) {
            userAddressJpaRepository.clearDefaultForUser(user.getId());
            entity.setDefaultShipping(true);
        } else {
            entity.setDefaultShipping(false);
        }

        UserAddressEntity saved = userAddressJpaRepository.save(entity);
        syncLegacyAddress(user);
        userJpaRepository.save(user);
        return toAddressResponse(saved);
    }

    @Override
    @Transactional
    public CommerceDtos.AddressResponse updateAddress(String email, Long addressId, CommerceDtos.UpsertAddressRequest request) {
        UserEntity user = findUser(email);
        UserAddressEntity entity = userAddressJpaRepository.findById(addressId)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Address not found"));

        applyUpsert(entity, request);

        if (Boolean.TRUE.equals(request.makeDefault())) {
            userAddressJpaRepository.clearDefaultForUser(user.getId());
            entity.setDefaultShipping(true);
        }

        UserAddressEntity saved = userAddressJpaRepository.save(entity);
        syncLegacyAddress(user);
        userJpaRepository.save(user);
        return toAddressResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        UserEntity user = findUser(email);
        UserAddressEntity entity = userAddressJpaRepository.findById(addressId)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Address not found"));

        boolean wasDefault = entity.isDefaultShipping();
        userAddressJpaRepository.delete(entity);

        if (wasDefault) {
            List<UserAddressEntity> rest = userAddressJpaRepository.findByUser_IdOrderByIdAsc(user.getId());
            if (!rest.isEmpty()) {
                UserAddressEntity next = rest.getFirst();
                next.setDefaultShipping(true);
                userAddressJpaRepository.save(next);
            }
        }

        syncLegacyAddress(user);
        userJpaRepository.save(user);
    }

    @Override
    @Transactional
    public CommerceDtos.ProfileImageResponse uploadProfileImage(String email, MultipartFile image) {
        UserEntity user = findUser(email);
        validateImage(image);
        String imageUrl = profileImageStorageService.store(image);
        user.setProfileImageUrl(imageUrl);
        return new CommerceDtos.ProfileImageResponse(imageUrl, "Profile image uploaded successfully");
    }

    @Override
    @Transactional
    public CommerceDtos.ProfileImageResponse updateProfileImage(String email, MultipartFile image) {
        UserEntity user = findUser(email);
        validateImage(image);
        String oldImageUrl = user.getProfileImageUrl();
        String imageUrl = profileImageStorageService.store(image);
        user.setProfileImageUrl(imageUrl);
        profileImageStorageService.deleteByPublicUrl(oldImageUrl);
        return new CommerceDtos.ProfileImageResponse(imageUrl, "Profile image updated successfully");
    }

    @Override
    @Transactional
    public CommerceDtos.ProfileImageResponse deleteProfileImage(String email) {
        UserEntity user = findUser(email);
        String oldImageUrl = user.getProfileImageUrl();
        user.setProfileImageUrl(null);
        profileImageStorageService.deleteByPublicUrl(oldImageUrl);
        return new CommerceDtos.ProfileImageResponse(null, "Profile image deleted successfully");
    }

    private UserEntity findUser(String email) {
        return userJpaRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User profile not found"));
    }

    private void applyUpsert(UserAddressEntity entity, CommerceDtos.UpsertAddressRequest request) {
        entity.setLabel(trimToBlank(request.label()));
        entity.setFullName(trimToBlank(request.fullName()));
        entity.setPhone(trimToBlank(request.phone()));
        entity.setEmail(blankToNull(trimmed(request.email())));
        entity.setLine1(trimToBlank(request.line1()));
        entity.setLine2(blankToNull(trimmed(request.line2())));
        entity.setCity(trimToBlank(request.city()));
        entity.setRegion(blankToNull(trimmed(request.region())));
        entity.setPostalCode(trimToBlank(request.postalCode()));
        entity.setCountry(trimToBlank(request.country()));
    }

    private static String trimmed(String v) {
        return v == null ? null : v.trim();
    }

    private static String trimToBlank(String v) {
        return v == null ? "" : v.trim();
    }

    private static String blankToNull(String v) {
        return v == null || v.isEmpty() ? null : v;
    }

    private static void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image file is required");
        }
        if (image.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image size must be 2MB or less");
        }
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG and PNG images are allowed");
        }
    }

    private void syncLegacyAddress(UserEntity user) {
        userAddressJpaRepository.findFirstByUser_IdAndDefaultShippingTrue(user.getId())
                .ifPresentOrElse(
                        a -> user.setAddress(formatLegacy(a)),
                        () -> user.setAddress(null)
                );
    }

    private static String formatLegacy(UserAddressEntity a) {
        String line2part = a.getLine2() != null && !a.getLine2().isBlank()
                ? ", " + a.getLine2().trim()
                : "";
        String regionPart = a.getRegion() != null && !a.getRegion().isBlank()
                ? ", " + a.getRegion().trim()
                : "";
        return String.join(
                "",
                a.getLine1().trim(),
                line2part,
                ", ",
                a.getCity().trim(),
                " ",
                a.getPostalCode().trim(),
                regionPart,
                ", ",
                a.getCountry().trim()
        );
    }

    private CommerceDtos.ProfileResponse toResponse(UserEntity user) {
        List<CommerceDtos.AddressResponse> addresses = userAddressJpaRepository
                .findByUser_IdOrderByDefaultShippingDescIdAsc(user.getId()).stream()
                .map(this::toAddressResponse)
                .toList();

        String phone = user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()
                ? "N/A"
                : user.getPhoneNumber();

        String legacySummary = userAddressJpaRepository
                .findFirstByUser_IdAndDefaultShippingTrue(user.getId())
                .map(ProfileServiceImpl::formatLegacy)
                .filter(s -> !s.isBlank())
                .orElseGet(() -> blankToNa(user.getAddress()));

        return new CommerceDtos.ProfileResponse(
                user.getEmail(),
                user.getFullName(),
                phone,
                legacySummary,
                user.getProfileImageUrl(),
                user.isMarketingEmailOptIn(),
                addresses
        );
    }

    private static String blankToNa(String v) {
        return v == null || v.isBlank() ? "N/A" : v;
    }

    private CommerceDtos.AddressResponse toAddressResponse(UserAddressEntity a) {
        return new CommerceDtos.AddressResponse(
                a.getId(),
                a.getLabel(),
                a.getFullName(),
                a.getPhone(),
                a.getEmail(),
                a.getLine1(),
                a.getLine2(),
                a.getCity(),
                a.getRegion(),
                a.getPostalCode(),
                a.getCountry(),
                a.isDefaultShipping()
        );
    }
}
