package com.civicpulse.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.civicpulse.backend.entity.Issue;
import com.civicpulse.backend.entity.Role;
import com.civicpulse.backend.entity.User;
import com.civicpulse.backend.repository.IssueRepository;
import com.civicpulse.backend.repository.UserRepository;

class IssueServiceTest {

    private IssueRepository issueRepository;
    private UserRepository userRepository;
    private IssueService issueService;

    @BeforeEach
    void setUp() {
        issueRepository = mock(IssueRepository.class);
        userRepository = mock(UserRepository.class);
        issueService = new IssueService(issueRepository, userRepository);

        User user = new User();
        setId(user, 1L);
        user.setEmail("user@example.com");
        user.setRole(Role.USER);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user@example.com", "password")
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAllIssuesFiltersByDateAndSearchTerms() {
        Issue recentIssue = new Issue();
        recentIssue.setTitle("Broken streetlight");
        recentIssue.setLocation("Downtown");
        recentIssue.setCategory("Infrastructure");
        recentIssue.setStatus("Pending");
        setCreatedDate(recentIssue, LocalDateTime.of(2026, 8, 1, 10, 0));

        Issue olderIssue = new Issue();
        olderIssue.setTitle("Pothole repair");
        olderIssue.setLocation("Northside");
        olderIssue.setCategory("Roads");
        olderIssue.setStatus("Resolved");
        setCreatedDate(olderIssue, LocalDateTime.of(2026, 7, 30, 9, 0));

        when(issueRepository.findByUser(any(User.class))).thenReturn(List.of(recentIssue, olderIssue));

        List<Issue> filteredIssues = issueService.getAllIssues("streetlight", "Pending", "Infrastructure", "Downtown", "2026-08-01");

        assertEquals(1, filteredIssues.size());
        assertEquals("Broken streetlight", filteredIssues.get(0).getTitle());
    }

    private void setId(User user, Long id) {
        try {
            Field field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (ReflectiveOperationException ex) {
            throw new RuntimeException(ex);
        }
    }

    private void setCreatedDate(Issue issue, LocalDateTime createdDate) {
        try {
            Field field = Issue.class.getDeclaredField("createdDate");
            field.setAccessible(true);
            field.set(issue, createdDate);
        } catch (ReflectiveOperationException ex) {
            throw new RuntimeException(ex);
        }
    }
}
