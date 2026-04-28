package com.kindcare.api.controller;

import com.kindcare.api.entity.Child;
import com.kindcare.api.service.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/children")
@RequiredArgsConstructor
public class ChildController {

    private final ChildService childService;

    @GetMapping
    public ResponseEntity<List<Child>> getAllChildren(Principal principal) {
        return ResponseEntity.ok(childService.getAllChildren(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Child> getChild(@PathVariable Long id) {
        return ResponseEntity.ok(childService.getChild(id));
    }

    @PostMapping
    public ResponseEntity<Child> createChild(@RequestBody Child child) {
        return ResponseEntity.ok(childService.createChild(child));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChild(@PathVariable Long id) {
        childService.deleteChild(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/link")
    public ResponseEntity<Map<String, String>> linkChild(
            @RequestParam String code,
            Principal principal) {
        childService.linkChildToParent(code, principal.getName());
        return ResponseEntity.ok(Map.of("message", "자녀가 성공적으로 연결되었습니다."));
    }
}