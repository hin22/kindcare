package com.kindcare.api.service;

import com.kindcare.api.dto.MedicationCreateRequest;
import com.kindcare.api.dto.MedicationDto;

import java.time.LocalDate;
import java.util.List;

public interface MedicationService {

    List<MedicationDto> listForTeacher(LocalDate serviceDate);

    List<MedicationDto> listForParent(String parentEmail);

    MedicationDto create(MedicationCreateRequest request, String parentEmail);

    MedicationDto complete(Long medicationId, String teacherEmail);
}
