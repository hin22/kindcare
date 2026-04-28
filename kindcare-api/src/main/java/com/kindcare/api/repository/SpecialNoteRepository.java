package com.kindcare.api.repository;

import com.kindcare.api.entity.SpecialNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SpecialNoteRepository extends JpaRepository<SpecialNote, Long> {
    List<SpecialNote> findByDateBetween(LocalDate start, LocalDate end);
    List<SpecialNote> findByChildIdAndDate(Long childId, LocalDate date);
    List<SpecialNote> findByChildIdInAndDateBetween(List<Long> childIds, LocalDate start, LocalDate end);
    boolean existsByChildIdAndDateAndCheckedFalse(Long childId, LocalDate date);
}
