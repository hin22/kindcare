package com.kindcare.api.dto;

import com.kindcare.api.entity.Event;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CalendarDayDto {
    private LocalDate date;
    private List<EventDto> events;
    private List<ChildChipDto> children; // 특이사항 있는 원아 목록 (선생님용)

    @Data
    public static class EventDto {
        private Long id;
        private String title;
        private String description;
        private LocalDate date;
        private Event.EventType type;
    }

    @Data
    public static class ChildChipDto {
        private Long childId;
        private String childName;
        private boolean hasUnchecked; // △ 표시 여부
        private int totalCount;
        private int uncheckedCount;
    }
}
