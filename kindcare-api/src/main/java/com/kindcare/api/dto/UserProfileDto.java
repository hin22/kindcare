package com.kindcare.api.dto;

import com.kindcare.api.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private User.Role role;
    private String avatarUrl;
}
