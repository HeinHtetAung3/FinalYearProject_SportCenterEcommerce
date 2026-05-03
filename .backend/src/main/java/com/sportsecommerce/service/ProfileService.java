package com.sportsecommerce.service;

import com.sportsecommerce.dto.CommerceDtos;
import org.springframework.web.multipart.MultipartFile;

public interface ProfileService {
    CommerceDtos.ProfileResponse get(String email);

    CommerceDtos.ProfileResponse update(String email, CommerceDtos.UpdateProfileRequest request);

    void changePassword(String email, CommerceDtos.ChangePasswordRequest request);

    CommerceDtos.AddressResponse addAddress(String email, CommerceDtos.UpsertAddressRequest request);

    CommerceDtos.AddressResponse updateAddress(String email, Long addressId, CommerceDtos.UpsertAddressRequest request);

    void deleteAddress(String email, Long addressId);

    CommerceDtos.ProfileImageResponse uploadProfileImage(String email, MultipartFile image);

    CommerceDtos.ProfileImageResponse updateProfileImage(String email, MultipartFile image);

    CommerceDtos.ProfileImageResponse deleteProfileImage(String email);
}
