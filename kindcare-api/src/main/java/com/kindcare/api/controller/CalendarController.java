package com.kindcare.api.controller;

import com.kindcare.api.dto.CalendarDayDto;
import com.kindcare.api.dto.SpecialNoteDto;
import com.kindcare.api.entity.*;
import com.kindcare.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final EventRepository eventRepository;
    private final SpecialNoteRepository specialNoteRepository;

    /**
     * 월별 달력 요약: 행사 + 특이사항 있는 원아 목록
     * GET /api/calendar/summary?yearMonth=2026-04
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, CalendarDayDto>> getSummary(
            @RequestParam String yearMonth,
            Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        YearMonth ym = YearMonth.parse(yearMonth);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // 행사 조회
        List<Event> events = eventRepository.findByDateBetween(start, end);

        // 특이사항 조회 (역할별)
        List<SpecialNote> specialNotes;
        if (user.getRole() == User.Role.TEACHER) {
            specialNotes = specialNoteRepository.findByDateBetween(start, end);
        } else {
            List<Child> myChildren = childRepository.findByParentsId(user.getId());
            List<Long> childIds = myChildren.stream().map(Child::getId).toList();
            specialNotes = childIds.isEmpty() ? List.of()
                    : specialNoteRepository.findByChildIdInAndDateBetween(childIds, start, end);
        }

        // 날짜별로 그룹핑
        Map<LocalDate, List<Event>> eventsByDate = events.stream()
                .collect(Collectors.groupingBy(Event::getDate));
        Map<LocalDate, List<SpecialNote>> notesByDate = specialNotes.stream()
                .collect(Collectors.groupingBy(SpecialNote::getDate));

        // 달력 데이터 조합
        Map<String, CalendarDayDto> result = new LinkedHashMap<>();
        Set<LocalDate> allDates = new LinkedHashSet<>();
        allDates.addAll(eventsByDate.keySet());
        allDates.addAll(notesByDate.keySet());

        for (LocalDate date : allDates) {
            CalendarDayDto day = new CalendarDayDto();
            day.setDate(date);

            // 행사 목록
            List<CalendarDayDto.EventDto> eventDtos = eventsByDate.getOrDefault(date, List.of())
                    .stream().map(e -> {
                        CalendarDayDto.EventDto dto = new CalendarDayDto.EventDto();
                        dto.setId(e.getId());
                        dto.setTitle(e.getTitle());
                        dto.setDescription(e.getDescription());
                        dto.setDate(e.getDate());
                        dto.setType(e.getType());
                        return dto;
                    }).toList();
            day.setEvents(eventDtos);

            // 원아별 특이사항 집계 (선생님: 전체, 학부모: 본인 자녀)
            List<SpecialNote> dayNotes = notesByDate.getOrDefault(date, List.of());
            Map<Long, List<SpecialNote>> byChild = dayNotes.stream()
                    .collect(Collectors.groupingBy(n -> n.getChild().getId()));

            List<CalendarDayDto.ChildChipDto> chips = byChild.entrySet().stream().map(entry -> {
                List<SpecialNote> childNotes = entry.getValue();
                long unchecked = childNotes.stream().filter(n -> !n.isChecked()).count();
                CalendarDayDto.ChildChipDto chip = new CalendarDayDto.ChildChipDto();
                chip.setChildId(entry.getKey());
                chip.setChildName(childNotes.get(0).getChild().getName());
                chip.setHasUnchecked(unchecked > 0);
                chip.setTotalCount(childNotes.size());
                chip.setUncheckedCount((int) unchecked);
                return chip;
            }).toList();
            day.setChildren(chips);

            result.put(date.toString(), day);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * 특정 원아의 특정일 특이사항 목록
     * GET /api/calendar/special-notes?childId=1&date=2026-04-27
     */
    @GetMapping("/special-notes")
    public ResponseEntity<List<SpecialNoteDto>> getSpecialNotes(
            @RequestParam Long childId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<SpecialNote> notes = specialNoteRepository.findByChildIdAndDate(childId, date);
        List<SpecialNoteDto> dtos = notes.stream().map(this::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * 특이사항 등록 (학부모)
     * POST /api/calendar/special-notes
     */
    @PostMapping("/special-notes")
    public ResponseEntity<SpecialNoteDto> createSpecialNote(
            @RequestBody SpecialNoteDto request,
            Principal principal) {

        User parent = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("원아를 찾을 수 없습니다."));

        SpecialNote note = new SpecialNote();
        note.setChild(child);
        note.setParent(parent);
        note.setDate(request.getDate());
        note.setContent(request.getContent());
        note.setChecked(false);

        SpecialNote saved = specialNoteRepository.save(note);
        return ResponseEntity.ok(toDto(saved));
    }

    /**
     * 체크 토글 (선생님)
     * PATCH /api/calendar/special-notes/{id}/check
     */
    @PatchMapping("/special-notes/{id}/check")
    public ResponseEntity<Void> toggleCheck(@PathVariable Long id) {
        SpecialNote note = specialNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("특이사항을 찾을 수 없습니다."));
        note.setChecked(!note.isChecked());
        specialNoteRepository.save(note);
        return ResponseEntity.ok().build();
    }

    /**
     * 행사 등록 (선생님)
     * POST /api/calendar/events
     */
    @PostMapping("/events")
    public ResponseEntity<CalendarDayDto.EventDto> createEvent(
            @RequestBody CalendarDayDto.EventDto request,
            Principal principal) {

        User teacher = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setType(request.getType());
        event.setDate(request.getDate());
        event.setCreatedBy(teacher);

        Event saved = eventRepository.save(event);
        CalendarDayDto.EventDto dto = new CalendarDayDto.EventDto();
        dto.setId(saved.getId());
        dto.setTitle(saved.getTitle());
        dto.setDescription(saved.getDescription());
        dto.setType(saved.getType());
        return ResponseEntity.ok(dto);
    }

    /**
     * 행사 삭제 (선생님)
     * DELETE /api/calendar/events/{id}
     */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private SpecialNoteDto toDto(SpecialNote note) {
        SpecialNoteDto dto = new SpecialNoteDto();
        dto.setId(note.getId());
        dto.setChildId(note.getChild().getId());
        dto.setChildName(note.getChild().getName());
        dto.setParentName(note.getParent().getName());
        dto.setDate(note.getDate());
        dto.setContent(note.getContent());
        dto.setChecked(note.isChecked());
        return dto;
    }
}
