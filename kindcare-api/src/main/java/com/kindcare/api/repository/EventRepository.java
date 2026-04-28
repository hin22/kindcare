package com.kindcare.api.repository;

import com.kindcare.api.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByDateBetween(LocalDate start, LocalDate end);
    long countByType(Event.EventType type);
}
