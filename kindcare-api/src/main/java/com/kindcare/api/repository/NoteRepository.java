package com.kindcare.api.repository;

import com.kindcare.api.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByChildId(Long childId);
    Optional<Note> findByChildIdAndDate(Long childId, LocalDate date);
    long countByDate(LocalDate date);
    long countByChildIdInAndDate(List<Long> childIds, LocalDate date);
}