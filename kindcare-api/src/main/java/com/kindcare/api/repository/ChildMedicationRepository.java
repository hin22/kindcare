package com.kindcare.api.repository;

import com.kindcare.api.entity.ChildMedication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ChildMedicationRepository extends JpaRepository<ChildMedication, Long> {

    List<ChildMedication> findByServiceDateOrderByIdDesc(LocalDate serviceDate);

    List<ChildMedication> findByChildIdInOrderByServiceDateDescIdDesc(List<Long> childIds);

    long countByStatusAndServiceDate(ChildMedication.Status status, LocalDate date);

    long countByChildIdInAndStatusAndServiceDate(
            List<Long> childIds,
            ChildMedication.Status status,
            LocalDate date);
}
