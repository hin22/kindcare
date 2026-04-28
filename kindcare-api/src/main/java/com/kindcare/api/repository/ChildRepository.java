package com.kindcare.api.repository;

import com.kindcare.api.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChildRepository extends JpaRepository<Child, Long> {
    Optional<Child> findByInviteCode(String inviteCode);
    List<Child> findByParentsId(Long parentId);
}