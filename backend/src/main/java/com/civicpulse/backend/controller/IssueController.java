package com.civicpulse.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.civicpulse.backend.dto.DashboardStats;
import com.civicpulse.backend.dto.IssueRequest;
import com.civicpulse.backend.entity.Issue;
import com.civicpulse.backend.service.IssueService;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "http://localhost:5173")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    // Create a new issue
    @PostMapping
    public ResponseEntity<Issue> createIssue(@RequestBody IssueRequest request) {

        System.out.println("CREATE ISSUE CONTROLLER HIT");

        Issue issue = issueService.createIssue(request);

        return ResponseEntity.ok(issue);
    }

    // Get all issues with optional filters
    @GetMapping
    public ResponseEntity<List<Issue>> getAllIssues(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String date) {

        return ResponseEntity.ok(issueService.getAllIssues(search, status, category, location, date));
    }

    // Get issue by ID
    @GetMapping("/{id}")
    public ResponseEntity<Issue> getIssueById(@PathVariable Long id) {

        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    // Update issue details
    @PutMapping("/{id}")
    public ResponseEntity<Issue> updateIssue(
            @PathVariable Long id,
            @RequestBody IssueRequest request) {

        Issue issue = issueService.updateIssue(id, request);

        return ResponseEntity.ok(issue);
    }

    // Update issue status
    @PutMapping("/{id}/status")
    public ResponseEntity<Issue> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Issue issue = issueService.updateStatus(id, status);

        return ResponseEntity.ok(issue);
    }

    // Delete issue
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteIssue(@PathVariable Long id) {

        issueService.deleteIssue(id);

        return ResponseEntity.ok("Issue deleted successfully");
    }

    // Dashboard statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {

        return ResponseEntity.ok(issueService.getDashboardStats());
    }
}