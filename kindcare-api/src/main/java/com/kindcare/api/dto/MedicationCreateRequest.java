package com.kindcare.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MedicationCreateRequest {

    @NotNull
    private Long childId;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate serviceDate;

    @NotBlank
    private String medicineName;

    @NotBlank
    private String dosage;

    private String timeNote;
    private String memo;
}
