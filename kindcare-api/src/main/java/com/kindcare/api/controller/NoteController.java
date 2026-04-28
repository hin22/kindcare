package com.kindcare.api.controller;

import com.kindcare.api.dto.CommentRequest;
import com.kindcare.api.dto.NoteRequest;
import com.kindcare.api.dto.NoteResponse;
import com.kindcare.api.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<?> getNote(
            @RequestParam Long childId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return noteService.getNoteByChildAndDate(childId, date)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @RequestBody NoteRequest request,
            Principal principal) {
        return ResponseEntity.ok(noteService.createNote(request, principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable Long id,
            @RequestBody NoteRequest request) {
        return ResponseEntity.ok(noteService.updateNote(id, request));
    }

    @PutMapping("/{id}/comment")
    public ResponseEntity<Void> addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest request) {
        noteService.addParentComment(id, request.getParentComment());
        return ResponseEntity.ok().build();
    }
}
