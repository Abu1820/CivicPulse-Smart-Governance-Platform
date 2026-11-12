package com.civicpulse.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.civicpulse.backend.entity.Issue;
import com.civicpulse.backend.entity.User;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    long countByStatus(String status);
    List<Issue> findByUser(User user);

    @Query("SELECT i.category, COUNT(i) FROM Issue i GROUP BY i.category")
    List<Object[]> countGroupByCategory();

}