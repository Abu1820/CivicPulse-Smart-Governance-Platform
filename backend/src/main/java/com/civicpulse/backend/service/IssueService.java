package com.civicpulse.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.civicpulse.backend.dto.DashboardStats;
import com.civicpulse.backend.dto.IssueRequest;
import com.civicpulse.backend.entity.Issue;
import com.civicpulse.backend.entity.Role;
import com.civicpulse.backend.entity.User;
import com.civicpulse.backend.repository.IssueRepository;
import com.civicpulse.backend.repository.UserRepository;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    public IssueService(IssueRepository issueRepository, UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    // Create a new issue
    public Issue createIssue(IssueRequest request) {
    	System.out.println(">>> createIssue() called");

        Issue issue = new Issue();
        User currentUser = getCurrentUser();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setLocation(request.getLocation());
        issue.setCategory(request.getCategory());
        issue.setStatus("Pending");
        issue.setUser(currentUser);

        return issueRepository.save(issue);
    }

    // Get all issues
    public List<Issue> getAllIssues() {
        return getAllIssues(null, null, null, null, null);
    }

    public List<Issue> getAllIssues(String search, String status, String category, String location) {
        return getAllIssues(search, status, category, location, null);
    }

    public List<Issue> getAllIssues(String search, String status, String category, String location, String date) {
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        List<Issue> issues = isAdmin
                ? issueRepository.findAll()
                : issueRepository.findByUser(currentUser);

        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        String normalizedStatus = status == null ? "" : status.trim();
        String normalizedCategory = category == null ? "" : category.trim();
        String normalizedLocation = location == null ? "" : location.trim();
        LocalDate filterDate = parseDate(date);

        return issues.stream()
                .filter(issue -> matchesFilters(
                        issue,
                        normalizedSearch,
                        normalizedStatus,
                        normalizedCategory,
                        normalizedLocation,
                        filterDate))
                .toList();
    }

    // Get issue by ID
    public Issue getIssueById(Long id) {
        return findIssue(id);
    }

    // Update issue details
    public Issue updateIssue(Long id, IssueRequest request) {

        Issue issue = findIssue(id);
        requireOwnership(issue);

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setLocation(request.getLocation());
        issue.setCategory(request.getCategory());

        return issueRepository.save(issue);
    }

    // Update issue status
    public Issue updateStatus(Long id, String status) {

        Issue issue = findIssue(id);
        requireOwnership(issue);

        issue.setStatus(status);

        return issueRepository.save(issue);
    }

    // Delete issue
    public void deleteIssue(Long id) {

        Issue issue = findIssue(id);
        requireOwnership(issue);

        issueRepository.delete(issue);
    }

    // Dashboard statistics
    public DashboardStats getDashboardStats() {

        long total = issueRepository.count();
        long pending = issueRepository.countByStatus("Pending");
        long inProgress = issueRepository.countByStatus("In Progress");
        long resolved = issueRepository.countByStatus("Resolved");

        return new DashboardStats(
                total,
                pending,
                inProgress,
                resolved
        );
    }

    private boolean matchesFilters(Issue issue, String search, String status, String category, String location, LocalDate filterDate) {

        boolean matchesSearch = search.isBlank()
                || contains(issue.getTitle(), search)
                || contains(issue.getDescription(), search)
                || contains(issue.getLocation(), search)
                || contains(issue.getCategory(), search);

        boolean matchesStatus = status.isBlank() || status.equalsIgnoreCase(issue.getStatus());
        boolean matchesCategory = category.isBlank() || category.equalsIgnoreCase(issue.getCategory());
        boolean matchesLocation = location.isBlank() || contains(issue.getLocation(), location.toLowerCase());
        boolean matchesDate = filterDate == null || matchesDate(issue.getCreatedDate(), filterDate);

        return matchesSearch && matchesStatus && matchesCategory && matchesLocation && matchesDate;
    }

    private boolean matchesDate(LocalDateTime createdDate, LocalDate filterDate) {
        if (createdDate == null) {
            return false;
        }

        return createdDate.toLocalDate().equals(filterDate);
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        System.out.println("========== AUTH DEBUG ==========");
        System.out.println(authentication);
        System.out.println("Name = " + authentication.getName());

        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);

        System.out.println("USER FOUND = " + user);

        if (user == null) {
            throw new RuntimeException("User not found in DB");
        }

        return user;
    }

    private void requireOwnership(Issue issue) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN && !issue.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not allowed to manage this issue");
        }
    }

    // Helper method to find an issue
    private Issue findIssue(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
    }
}