package com.kindcare.api.controller;

import com.kindcare.api.entity.Child;
import com.kindcare.api.entity.User;
import com.kindcare.api.entity.ChildMedication;
import com.kindcare.api.repository.ChildMedicationRepository;
import com.kindcare.api.repository.ChildRepository;
import com.kindcare.api.repository.NoteRepository;
import com.kindcare.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final NoteRepository noteRepository;
    private final ChildMedicationRepository childMedicationRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        long totalChildren;
        long todayNotes;
        long pendingMedication;

        if (user.getRole() == User.Role.TEACHER) {
            totalChildren = childRepository.count();
            todayNotes     = noteRepository.countByDate(today);
            pendingMedication = childMedicationRepository.countByStatusAndServiceDate(
                    ChildMedication.Status.PENDING, today);
        } else {
            List<Child> myChildren = childRepository.findByParentsId(user.getId());
            totalChildren = myChildren.size();
            List<Long> childIds = myChildren.stream().map(Child::getId).toList();
            todayNotes = childIds.isEmpty() ? 0
                    : noteRepository.countByChildIdInAndDate(childIds, today);
            pendingMedication = childIds.isEmpty() ? 0
                    : childMedicationRepository.countByChildIdInAndStatusAndServiceDate(
                            childIds, ChildMedication.Status.PENDING, today);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("totalChildren", totalChildren);
        body.put("todayNotes", todayNotes);
        body.put("pendingMedication", pendingMedication);
        return ResponseEntity.ok(body);
    }
}
