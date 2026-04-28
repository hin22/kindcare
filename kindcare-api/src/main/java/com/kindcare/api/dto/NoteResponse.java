package com.kindcare.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class NoteResponse {
    private Long id;
    private Long childId;
    private String childName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String mood;
    private String health;
    private String meals;
    private String activities;
    private String content;
    private String specialNotes;
    private String parentComment;
    private String teacherName;
}
