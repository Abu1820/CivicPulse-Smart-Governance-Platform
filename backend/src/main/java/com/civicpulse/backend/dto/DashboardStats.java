package com.civicpulse.backend.dto;

import java.util.Map;

public class DashboardStats {

    private long totalIssues;
    private long pendingIssues;
    private long inProgressIssues;
    private long resolvedIssues;
    private Map<String, Long> categoryStats;

    public DashboardStats() {
    }

    public DashboardStats(long totalIssues, long pendingIssues, long inProgressIssues, long resolvedIssues) {
        this.totalIssues = totalIssues;
        this.pendingIssues = pendingIssues;
        this.inProgressIssues = inProgressIssues;
        this.resolvedIssues = resolvedIssues;
    }

    public DashboardStats(long totalIssues, long pendingIssues, long inProgressIssues, long resolvedIssues, Map<String, Long> categoryStats) {
        this.totalIssues = totalIssues;
        this.pendingIssues = pendingIssues;
        this.inProgressIssues = inProgressIssues;
        this.resolvedIssues = resolvedIssues;
        this.categoryStats = categoryStats;
    }

    public long getTotalIssues() {
        return totalIssues;
    }

    public void setTotalIssues(long totalIssues) {
        this.totalIssues = totalIssues;
    }

    public long getPendingIssues() {
        return pendingIssues;
    }

    public void setPendingIssues(long pendingIssues) {
        this.pendingIssues = pendingIssues;
    }

    public long getInProgressIssues() {
        return inProgressIssues;
    }

    public void setInProgressIssues(long inProgressIssues) {
        this.inProgressIssues = inProgressIssues;
    }

    public long getResolvedIssues() {
        return resolvedIssues;
    }

    public void setResolvedIssues(long resolvedIssues) {
        this.resolvedIssues = resolvedIssues;
    }

    public Map<String, Long> getCategoryStats() {
        return categoryStats;
    }

    public void setCategoryStats(Map<String, Long> categoryStats) {
        this.categoryStats = categoryStats;
    }
}
