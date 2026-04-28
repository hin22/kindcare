package com.kindcare.api.service;

import com.kindcare.api.entity.Child;
import com.kindcare.api.entity.User;
import com.kindcare.api.repository.ChildRepository;
import com.kindcare.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChildServiceImpl implements ChildService {

    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public List<Child> getAllChildren(String email) {
        User user = findUser(email);
        if (user.getRole() == User.Role.TEACHER) {
            return childRepository.findAll();
        }
        return childRepository.findByParentsId(user.getId());
    }

    @Override
    public Child getChild(Long id) {
        return childRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("아이를 찾을 수 없습니다."));
    }

    @Override
    public Child createChild(Child child) {
        child.setInviteCode(generateUniqueCode());
        return childRepository.save(child);
    }

    @Override
    public void deleteChild(Long id) {
        childRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void linkChildToParent(String inviteCode, String email) {
        User parent = findUser(email);
        if (parent.getRole() != User.Role.PARENT) {
            throw new IllegalStateException("학부모만 자녀를 연결할 수 있습니다.");
        }
        Child child = childRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 초대 코드입니다."));
        child.getParents().add(parent);
        childRepository.save(child);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (childRepository.findByInviteCode(code).isPresent());
        return code;
    }
}