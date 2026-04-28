package com.kindcare.api.config;

import com.kindcare.api.entity.Event;
import com.kindcare.api.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 서버 시작 시 한국 공휴일을 자동으로 DB에 삽입합니다.
 * 이미 공휴일 데이터가 있으면 건너뜁니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HolidayInitializer implements ApplicationRunner {

    private final EventRepository eventRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (eventRepository.countByType(Event.EventType.HOLIDAY) > 0) {
            log.info("[HolidayInitializer] 공휴일 데이터가 이미 존재합니다. 건너뜁니다.");
            return;
        }

        List<Event> holidays = new ArrayList<>();

        for (int year = 2024; year <= 2030; year++) {
            // ── 고정 공휴일 ──────────────────────────────
            holidays.add(h(year,  1,  1, "신정"));
            holidays.add(h(year,  3,  1, "삼일절"));
            holidays.add(h(year,  5,  5, "어린이날"));
            holidays.add(h(year,  6,  6, "현충일"));
            holidays.add(h(year,  8, 15, "광복절"));
            holidays.add(h(year, 10,  3, "개천절"));
            holidays.add(h(year, 10,  9, "한글날"));
            holidays.add(h(year, 12, 25, "크리스마스"));
        }

        // ── 설날 (음력 1/1 전후 3일) ─────────────────────
        addRange(holidays, 2024,  2,  9, 2024,  2, 12, "설날 연휴"); // 2/12 대체공휴일 포함
        addRange(holidays, 2025,  1, 28, 2025,  1, 30, "설날 연휴");
        addRange(holidays, 2026,  2, 16, 2026,  2, 18, "설날 연휴");
        addRange(holidays, 2027,  2,  5, 2027,  2,  7, "설날 연휴");
        addRange(holidays, 2028,  1, 26, 2028,  1, 28, "설날 연휴");
        addRange(holidays, 2029,  2, 12, 2029,  2, 14, "설날 연휴");
        addRange(holidays, 2030,  2,  2, 2030,  2,  4, "설날 연휴");

        // ── 추석 (음력 8/15 전후 3일) ────────────────────
        addRange(holidays, 2024,  9, 16, 2024,  9, 18, "추석 연휴");
        addRange(holidays, 2025, 10,  5, 2025, 10,  7, "추석 연휴");
        addRange(holidays, 2026,  9, 24, 2026,  9, 26, "추석 연휴");
        addRange(holidays, 2027,  9, 14, 2027,  9, 16, "추석 연휴");
        addRange(holidays, 2028, 10,  2, 2028, 10,  4, "추석 연휴"); // 10/3은 개천절과 겹침
        addRange(holidays, 2029,  9, 21, 2029,  9, 23, "추석 연휴");
        addRange(holidays, 2030, 10, 11, 2030, 10, 13, "추석 연휴");

        // ── 부처님오신날 (음력 4/8) ──────────────────────
        holidays.add(h(2024,  5, 15, "부처님오신날"));
        holidays.add(h(2025,  5,  5, "부처님오신날")); // 어린이날과 겹침
        holidays.add(h(2026,  5, 24, "부처님오신날"));
        holidays.add(h(2027,  5, 13, "부처님오신날"));
        holidays.add(h(2028,  5,  2, "부처님오신날"));
        holidays.add(h(2029,  5, 20, "부처님오신날"));
        holidays.add(h(2030,  5,  9, "부처님오신날"));

        // ── 어린이날 대체공휴일 (주말에 겹칠 때) ────────
        // 2024: 5/5 일요일 → 5/6(월) 대체
        holidays.add(h(2024, 5, 6, "어린이날 대체공휴일"));
        // 2029: 5/5 토요일 → 5/7(월) 대체
        holidays.add(h(2029, 5, 7, "어린이날 대체공휴일"));
        // 2030: 5/5 일요일 → 5/6(월) 대체
        holidays.add(h(2030, 5, 6, "어린이날 대체공휴일"));

        eventRepository.saveAll(holidays);
        log.info("[HolidayInitializer] 공휴일 {}건 등록 완료 (2024~2030)", holidays.size());
    }

    private Event h(int year, int month, int day, String title) {
        Event e = new Event();
        e.setTitle(title);
        e.setDate(LocalDate.of(year, month, day));
        e.setType(Event.EventType.HOLIDAY);
        e.setDescription("대한민국 법정 공휴일");
        return e;
    }

    /** start ~ end 날짜 범위를 연휴로 등록 */
    private void addRange(List<Event> list,
                          int sy, int sm, int sd,
                          int ey, int em, int ed,
                          String title) {
        LocalDate cur = LocalDate.of(sy, sm, sd);
        LocalDate end = LocalDate.of(ey, em, ed);
        while (!cur.isAfter(end)) {
            list.add(h(cur.getYear(), cur.getMonthValue(), cur.getDayOfMonth(), title));
            cur = cur.plusDays(1);
        }
    }
}
