package com.kindcare.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.kindcare.api.entity.ChildMedication;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MedicationDto {
    private Long id;
    private Long childId;
    private String childName;
    private Long parentId;
    private String parentName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate serviceDate;

    private String medicineName;
    private String dosage;
    private String timeNote;
    private String memo;

    private ChildMedication.Status status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completedAt;

    private String completedByName;
}
