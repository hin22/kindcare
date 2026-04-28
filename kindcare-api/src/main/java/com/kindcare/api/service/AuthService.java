package com.kindcare.api.service;

import com.kindcare.api.dto.AuthResponse;
import com.kindcare.api.dto.LoginRequest;
import com.kindcare.api.dto.SignupRequest;

public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
}
