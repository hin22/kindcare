package com.kindcare.api.service;

import com.kindcare.api.dto.MedicationCreateRequest;
import com.kindcare.api.dto.MedicationDto;
import com.kindcare.api.entity.Child;
import com.kindcare.api.entity.ChildMedication;
import com.kindcare.api.entity.User;
import com.kindcare.api.repository.ChildMedicationRepository;
import com.kindcare.api.repository.ChildRepository;
import com.kindcare.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicationServiceImpl implements MedicationService {

    private final ChildMedicationRepository medicationRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicationDto> listForTeacher(LocalDate serviceDate) {
        return medicationRepository.findByServiceDateOrderByIdDesc(serviceDate).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicationDto> listForParent(String parentEmail) {
        User parent = findUser(parentEmail);
        List<Child> children = childRepository.findByParentsId(parent.getId());
        List<Long> ids = children.stream().map(Child::getId).toList();
        if (ids.isEmpty()) {
            return List.of();
        }
        return medicationRepository.findByChildIdInOrderByServiceDateDescIdDesc(ids).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public MedicationDto create(MedicationCreateRequest request, String parentEmail) {
        User parent = findUser(parentEmail);
        if (parent.getRole() != User.Role.PARENT) {
            throw new IllegalArgumentException("학부모만 투약 의뢰를 등록할 수 있습니다.");
        }
        if (!childRepository.existsByIdAndParents_Id(request.getChildId(), parent.getId())) {
            throw new IllegalArgumentException("연결된 자녀에 대해서만 의뢰할 수 있습니다.");
        }
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new IllegalArgumentException("원아를 찾을 수 없습니다."));

        ChildMedication m = new ChildMedication();
        m.setChild(child);
        m.setParent(parent);
        m.setServiceDate(request.getServiceDate());
        m.setMedicineName(request.getMedicineName().trim());
        m.setDosage(request.getDosage().trim());
        m.setTimeNote(request.getTimeNote() != null ? request.getTimeNote().trim() : null);
        m.setMemo(request.getMemo() != null ? request.getMemo().trim() : null);
        m.setStatus(ChildMedication.Status.PENDING);

        return toDto(medicationRepository.save(m));
    }

    @Override
    @Transactional
    public MedicationDto complete(Long medicationId, String teacherEmail) {
        User teacher = findUser(teacherEmail);
        if (teacher.getRole() != User.Role.TEACHER) {
            throw new IllegalArgumentException("교사만 투약 완료 처리할 수 있습니다.");
        }
        ChildMedication m = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("투약 의뢰를 찾을 수 없습니다."));
        if (m.getStatus() == ChildMedication.Status.COMPLETED) {
            return toDto(m);
        }
        m.setStatus(ChildMedication.Status.COMPLETED);
        m.setCompletedAt(LocalDateTime.now());
        m.setCompletedBy(teacher);
        return toDto(medicationRepository.save(m));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private MedicationDto toDto(ChildMedication m) {
        MedicationDto d = new MedicationDto();
        d.setId(m.getId());
        d.setChildId(m.getChild().getId());
        d.setChildName(m.getChild().getName());
        d.setParentId(m.getParent().getId());
        d.setParentName(m.getParent().getName());
        d.setServiceDate(m.getServiceDate());
        d.setMedicineName(m.getMedicineName());
        d.setDosage(m.getDosage());
        d.setTimeNote(m.getTimeNote());
        d.setMemo(m.getMemo());
        d.setStatus(m.getStatus());
        d.setCompletedAt(m.getCompletedAt());
        if (m.getCompletedBy() != null) {
            d.setCompletedByName(m.getCompletedBy().getName());
        }
        return d;
    }
}
