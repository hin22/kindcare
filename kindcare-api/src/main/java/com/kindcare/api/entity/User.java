package com.kindcare.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column
    private String phone;

    /** 프로필 이미지 URL (HTTPS 권장, 직접 업로드는 추후 확장) */
    @Column(length = 2000)
    private String avatarUrl;

    public enum Role {
        TEACHER, PARENT
    }
}