package com.kindcare.api.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SpecialNoteDto {
    private Long id;
    private Long childId;
    private String childName;
    private String parentName;
    private LocalDate date;
    private String content;
    private boolean checked;
}
