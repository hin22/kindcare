package com.kindcare.api.dto;

import com.kindcare.api.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private User.Role role;
}
