package com.kindcare.api.controller;

import com.kindcare.api.dto.ProfileUpdateRequest;
import com.kindcare.api.dto.UserProfileDto;
import com.kindcare.api.entity.User;
import com.kindcare.api.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile(Principal principal) {
        User u = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return ResponseEntity.ok(toDto(u));
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Principal principal) {
        User u = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        u.setName(request.getName().trim());
        u.setPhone(request.getPhone() != null && !request.getPhone().isBlank()
                ? request.getPhone().trim()
                : null);
        u.setAvatarUrl(request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()
                ? request.getAvatarUrl().trim()
                : null);
        userRepository.save(u);
        return ResponseEntity.ok(toDto(u));
    }

    private UserProfileDto toDto(User u) {
        return new UserProfileDto(
                u.getId(),
                u.getEmail(),
                u.getName(),
                u.getPhone(),
                u.getRole(),
                u.getAvatarUrl()
        );
    }
}
