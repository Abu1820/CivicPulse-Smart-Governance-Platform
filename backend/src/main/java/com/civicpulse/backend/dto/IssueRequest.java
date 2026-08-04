package com.civicpulse.backend.dto;

public class IssueRequest {

    private String title;
    private String description;
    private String location;
    private String category;
    private String imagePath;

    public IssueRequest() {
    }

    public IssueRequest(String title, String description, String location, String category) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
}