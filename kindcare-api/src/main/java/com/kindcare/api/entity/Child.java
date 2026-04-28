package com.kindcare.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "children")
@Getter
@Setter
@NoArgsConstructor
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int age;

    @Column
    private String className;

    @Column
    private String gender;

    @Column
    private String allergies;

    @Column(unique = true)
    private String inviteCode;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "parent_children",
        joinColumns = @JoinColumn(name = "child_id"),
        inverseJoinColumns = @JoinColumn(name = "parent_id")
    )
    @JsonIgnore
    private Set<User> parents = new HashSet<>();
}