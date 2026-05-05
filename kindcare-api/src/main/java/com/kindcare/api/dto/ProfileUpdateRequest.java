package com.kindcare.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @NotBlank(message = "이름은 필수입니다.")
    private String name;
    private String phone;
    private String avatarUrl;
}
