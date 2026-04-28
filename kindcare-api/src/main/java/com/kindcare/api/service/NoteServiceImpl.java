package com.kindcare.api.service;

import com.kindcare.api.dto.NoteRequest;
import com.kindcare.api.dto.NoteResponse;
import com.kindcare.api.entity.Child;
import com.kindcare.api.entity.Note;
import com.kindcare.api.entity.User;
import com.kindcare.api.repository.ChildRepository;
import com.kindcare.api.repository.NoteRepository;
import com.kindcare.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<NoteResponse> getNoteByChildAndDate(Long childId, LocalDate date) {
        return noteRepository.findByChildIdAndDate(childId, date).map(this::toResponse);
    }

    @Override
    @Transactional
    public NoteResponse createNote(NoteRequest request, String teacherEmail) {
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("아이를 찾을 수 없습니다."));
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Note note = new Note();
        note.setChild(child);
        note.setTeacher(teacher);
        note.setDate(request.getDate());
        applyFields(note, request);

        return toResponse(noteRepository.save(note));
    }

    @Override
    @Transactional
    public NoteResponse updateNote(Long id, NoteRequest request) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("알림장을 찾을 수 없습니다."));
        applyFields(note, request);
        return toResponse(noteRepository.save(note));
    }

    @Override
    @Transactional
    public void addParentComment(Long id, String comment) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("알림장을 찾을 수 없습니다."));
        note.setParentComment(comment);
        noteRepository.save(note);
    }

    private void applyFields(Note note, NoteRequest req) {
        note.setMood(req.getMood());
        note.setHealth(req.getHealth());
        note.setMeals(req.getMeals());
        note.setActivities(req.getActivities());
        note.setContent(req.getContent());
        note.setSpecialNotes(req.getSpecialNotes());
    }

    private NoteResponse toResponse(Note note) {
        NoteResponse r = new NoteResponse();
        r.setId(note.getId());
        r.setChildId(note.getChild().getId());
        r.setChildName(note.getChild().getName());
        r.setDate(note.getDate());
        r.setMood(note.getMood());
        r.setHealth(note.getHealth());
        r.setMeals(note.getMeals());
        r.setActivities(note.getActivities());
        r.setContent(note.getContent());
        r.setSpecialNotes(note.getSpecialNotes());
        r.setParentComment(note.getParentComment());
        r.setTeacherName(note.getTeacher().getName());
        return r;
    }
}