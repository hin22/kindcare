package com.kindcare.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import java.time.LocalDate;

@Getter
public class NoteRequest {
    private Long childId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String mood;
    private String health;
    private String meals;
    private String activities;
    private String content;
    private String specialNotes;
}
