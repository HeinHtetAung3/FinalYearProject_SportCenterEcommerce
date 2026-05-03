package com.sportsecommerce.service;

import com.sportsecommerce.dto.AuthDtos;

public interface AuthService {
    AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request);

    AuthDtos.AuthResponse login(AuthDtos.LoginRequest request);

    AuthDtos.AuthResponse refresh(AuthDtos.RefreshRequest request);

    void logout(AuthDtos.LogoutRequest request);

    java.util.List<AuthDtos.AdminUserResponse> listUsers();

    AuthDtos.AdminUserResponse setUserEnabled(String email, boolean enabled);

    AuthDtos.AdminUserResponse setUserRole(String email, String role);
}
