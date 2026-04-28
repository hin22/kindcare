package com.kindcare.api.service;

import com.kindcare.api.dto.NoteRequest;
import com.kindcare.api.dto.NoteResponse;
import java.time.LocalDate;
import java.util.Optional;

public interface NoteService {
    Optional<NoteResponse> getNoteByChildAndDate(Long childId, LocalDate date);
    NoteResponse createNote(NoteRequest request, String teacherEmail);
    NoteResponse updateNote(Long id, NoteRequest request);
    void addParentComment(Long id, String comment);
}