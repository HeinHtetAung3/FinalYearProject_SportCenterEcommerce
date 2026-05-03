package com.sportsecommerce.service;

import com.sportsecommerce.dto.CommerceDtos;

public interface AccountService {

    void deactivateAccount(String email);

    void deleteAccount(String email, CommerceDtos.DeleteAccountRequest request);
}
