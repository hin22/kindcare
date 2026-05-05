package com.kindcare.api.controller;

import com.kindcare.api.dto.MedicationCreateRequest;
import com.kindcare.api.dto.MedicationDto;
import com.kindcare.api.entity.User;
import com.kindcare.api.repository.UserRepository;
import com.kindcare.api.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medication")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;
    private final UserRepository userRepository;

    /**
     * 교사: 해당 날짜 전체 의뢰 / 학부모: 연결된 자녀 의뢰만
     */
    @GetMapping
    public ResponseEntity<List<MedicationDto>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (user.getRole() == User.Role.PARENT) {
            return ResponseEntity.ok(medicationService.listForParent(principal.getName()));
        }

        LocalDate d = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(medicationService.listForTeacher(d));
    }

    @PostMapping
    public ResponseEntity<MedicationDto> create(
            @Valid @RequestBody MedicationCreateRequest request,
            Principal principal) {
        return ResponseEntity.ok(medicationService.create(request, principal.getName()));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<MedicationDto> complete(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(medicationService.complete(id, principal.getName()));
    }
}
