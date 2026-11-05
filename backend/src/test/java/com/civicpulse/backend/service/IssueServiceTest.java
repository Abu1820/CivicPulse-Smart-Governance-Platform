package com.civicpulse.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.civicpulse.backend.dto.IssueRequest;
import com.civicpulse.backend.entity.Issue;
import com.civicpulse.backend.entity.Role;
import com.civicpulse.backend.entity.User;
import com.civicpulse.backend.repository.IssueRepository;
import com.civicpulse.backend.repository.UserRepository;

class IssueServiceTest {

    private IssueRepository issueRepository;
    private UserRepository userRepository;
    private EmailNotificationService emailNotificationService;
    private IssueService issueService;
    private User regularUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        issueRepository = mock(IssueRepository.class);
        userRepository = mock(UserRepository.class);
        emailNotificationService = mock(EmailNotificationService.class);
        issueService = new IssueService(issueRepository, userRepository, emailNotificationService);

        regularUser = new User();
        setId(regularUser, 1L);
        regularUser.setName("Test User");
        regularUser.setEmail("user@example.com");
        regularUser.setRole(Role.USER);

        adminUser = new User();
        setId(adminUser, 2L);
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@example.com");
        adminUser.setRole(Role.ADMIN);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(regularUser));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        setAuth("user@example.com");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAllIssuesFiltersByDateAndSearchTerms() {
        Issue recentIssue = buildIssue("Broken streetlight", "Infrastructure", "Downtown", "Pending", LocalDateTime.of(2026, 8, 1, 10, 0));
        Issue olderIssue = buildIssue("Pothole repair", "Roads", "Northside", "Resolved", LocalDateTime.of(2026, 7, 30, 9, 0));

        when(issueRepository.findByUser(any(User.class))).thenReturn(List.of(recentIssue, olderIssue));

        List<Issue> result = issueService.getAllIssues("streetlight", "Pending", "Infrastructure", "Downtown", "2026-08-01");

        assertEquals(1, result.size());
        assertEquals("Broken streetlight", result.get(0).getTitle());
    }

    @Test
    void getAllIssues_adminSeesAllIssues() {
        setAuth("admin@example.com");
        Issue issue1 = buildIssue("Issue 1", "Road", "Area A", "Pending", LocalDateTime.now());
        Issue issue2 = buildIssue("Issue 2", "Garbage", "Area B", "Resolved", LocalDateTime.now());

        when(issueRepository.findAll()).thenReturn(List.of(issue1, issue2));

        List<Issue> result = issueService.getAllIssues(null, null, null, null, null);

        assertEquals(2, result.size());
    }

    @Test
    void getAllIssues_userSeesOnlyOwnIssues() {
        Issue myIssue = buildIssue("My Issue", "Road", "My Area", "Pending", LocalDateTime.now());
        when(issueRepository.findByUser(regularUser)).thenReturn(List.of(myIssue));

        List<Issue> result = issueService.getAllIssues(null, null, null, null, null);

        assertEquals(1, result.size());
        verify(issueRepository, never()).findAll();
    }

    @Test
    void createIssue_setsStatusToPending() {
        IssueRequest request = new IssueRequest("Flood", "Street flooding", "Main Road", "Drainage");
        Issue saved = buildIssue("Flood", "Drainage", "Main Road", "Pending", LocalDateTime.now());

        when(issueRepository.save(any(Issue.class))).thenReturn(saved);

        Issue result = issueService.createIssue(request);

        assertEquals("Pending", result.getStatus());
        verify(issueRepository).save(any(Issue.class));
    }

    @Test
    void updateStatus_throwsIfAlreadyResolved() {
        setAuth("admin@example.com");
        Issue issue = buildIssue("Old Issue", "Road", "Somewhere", "Resolved", LocalDateTime.now());
        setId(issue, 1L);

        when(issueRepository.findById(1L)).thenReturn(Optional.of(issue));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> issueService.updateStatus(1L, "In Progress"));

        assertEquals("Resolved issues cannot be updated.", ex.getMessage());
    }

    @Test
    void updateStatus_nonAdminThrowsAccessDenied() {
        setAuth("user@example.com");

        assertThrows(AccessDeniedException.class,
                () -> issueService.updateStatus(1L, "In Progress"));
    }

    @Test
    void deleteIssue_nonAdminThrowsAccessDenied() {
        setAuth("user@example.com");

        assertThrows(AccessDeniedException.class,
                () -> issueService.deleteIssue(1L));
    }

    @Test
    void deleteIssue_adminCanDelete() {
        setAuth("admin@example.com");
        Issue issue = buildIssue("To Delete", "Road", "Somewhere", "Pending", LocalDateTime.now());
        setId(issue, 5L);

        when(issueRepository.findById(5L)).thenReturn(Optional.of(issue));

        issueService.deleteIssue(5L);

        verify(issueRepository).delete(issue);
    }

    @Test
    void getIssueById_userCannotViewOtherUsersIssue() {
        User otherUser = new User();
        setId(otherUser, 99L);
        otherUser.setEmail("other@example.com");
        otherUser.setRole(Role.USER);

        Issue issue = buildIssue("Other's Issue", "Road", "Far Away", "Pending", LocalDateTime.now());
        setId(issue, 10L);
        issue.setUser(otherUser);

        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        assertThrows(AccessDeniedException.class, () -> issueService.getIssueById(10L));
    }

    @Test
    void getAllIssues_emptySearchReturnsAll() {
        Issue i1 = buildIssue("A", "Road", "X", "Pending", LocalDateTime.now());
        Issue i2 = buildIssue("B", "Garbage", "Y", "Resolved", LocalDateTime.now());
        when(issueRepository.findByUser(regularUser)).thenReturn(List.of(i1, i2));

        List<Issue> result = issueService.getAllIssues("", "", "", "", null);
        assertEquals(2, result.size());
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private void setAuth(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, "password"));
    }

    private Issue buildIssue(String title, String category, String location, String status, LocalDateTime createdDate) {
        Issue issue = new Issue();
        issue.setTitle(title);
        issue.setDescription("Description for " + title);
        issue.setCategory(category);
        issue.setLocation(location);
        issue.setStatus(status);
        issue.setUser(regularUser);
        setCreatedDate(issue, createdDate);
        return issue;
    }

    private void setId(Object obj, Long id) {
        try {
            Field field = obj.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(obj, id);
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
