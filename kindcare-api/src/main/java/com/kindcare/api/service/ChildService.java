package com.kindcare.api.service;

import com.kindcare.api.entity.Child;
import java.util.List;

public interface ChildService {
    List<Child> getAllChildren(String email);
    Child getChild(Long id);
    Child createChild(Child child);
    void deleteChild(Long id);
    void linkChildToParent(String inviteCode, String email);
}