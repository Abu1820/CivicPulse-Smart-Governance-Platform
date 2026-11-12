package com.civicpulse.backend.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(
	name = "issues",
	indexes = {
		@Index(name = "idx_issues_status", columnList = "status"),
		@Index(name = "idx_issues_category", columnList = "category"),
		@Index(name = "idx_issues_user_id", columnList = "user_id"),
		@Index(name = "idx_issues_created_date", columnList = "createdDate")
	}
)
public class Issue {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String description;

	@Column(nullable = false)
	private String location;

	@Column
	private Double latitude;

	@Column
	private Double longitude;

	@Column(nullable = false)
	private String category;

	@Column(nullable = false)
	private String status;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdDate;

	@Column
	private LocalDateTime updatedDate;

	@Column(name = "image_path")
	private String imagePath;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private User user;

	@PrePersist
	public void onCreate() {
		createdDate = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		updatedDate = LocalDateTime.now();
	}

	public Issue() {
	}

	public Long getId() {
		return id;
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

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public LocalDateTime getUpdatedDate() {
		return updatedDate;
	}

	public String getImagePath() {
		return imagePath;
	}

	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
