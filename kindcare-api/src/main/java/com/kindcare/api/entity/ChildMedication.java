package com.kindcare.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "child_medications")
@Getter
@Setter
@NoArgsConstructor
public class ChildMedication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    /** 의뢰한 학부모 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    /** 원내에서 투약 처리할 날짜 */
    @Column(nullable = false)
    private LocalDate serviceDate;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String dosage;

    /** 복용 시각 안내 (예: 점심 직후) */
    @Column
    private String timeNote;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by_id")
    private User completedBy;

    public enum Status {
        PENDING,
        COMPLETED
    }
}
