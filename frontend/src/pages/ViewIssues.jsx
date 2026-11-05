import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/ViewIssues.css";

function ViewIssues() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [issues, setIssues] = useState([]);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        category: "",
        location: "",
        date: ""
    });

    const [editingIssue, setEditingIssue] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        category: ""
    });

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        issueId: null
    });

    // Fetch All Issues
    const fetchIssues = async (currentFilters = filters) => {
        try {
            const params = new URLSearchParams();

            if (currentFilters.search) params.append("search", currentFilters.search);
            if (currentFilters.status) params.append("status", currentFilters.status);
            if (currentFilters.category) params.append("category", currentFilters.category);
            if (currentFilters.location) params.append("location", currentFilters.location);
            if (currentFilters.date) params.append("date", currentFilters.date);

            const response = await api.get(
                `/issues${params.toString() ? `?${params.toString()}` : ""}`
            );

            setIssues(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch issues");
        }
    };

    // Update Status
    const updateStatus = async (id, currentStatus) => {
        let newStatus = "";

        if (currentStatus === "Pending") {
            newStatus = "In Progress";
        } else if (currentStatus === "In Progress") {
            newStatus = "Resolved";
        } else {
            toast.info("Issue is already resolved");
            return;
        }

        try {
            await api.put(`/issues/${id}/status?status=${newStatus}`);
            toast.success("Status updated successfully!");
            fetchIssues();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    // Trigger delete confirmation modal
    const requestDelete = (id) => {
        setDeleteModal({ isOpen: true, issueId: id });
    };

    // Confirmed Delete Issue
    const handleDeleteConfirm = async () => {
        const id = deleteModal.issueId;
        setDeleteModal({ isOpen: false, issueId: null });

        try {
            await api.delete(`/issues/${id}`);
            toast.success("Issue deleted successfully!");
            fetchIssues();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete issue");
        }
    };

    // Open Edit Form
    const openEditForm = (issue) => {
        setEditingIssue(issue);
        setFormData({
            title: issue.title,
            description: issue.description,
            location: issue.location,
            category: issue.category
        });
    };

    // Handle Issue Form Input Change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle Filter Input Change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value
        }));
    };

    // Update Issue
    const updateIssue = async () => {
        try {
            await api.put(`/issues/${editingIssue.id}`, formData);
            toast.success("Issue updated successfully!");
            setEditingIssue(null);
            fetchIssues();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update issue");
        }
    };

    useEffect(() => {
        fetchIssues(filters);
    }, [filters.search, filters.status, filters.category, filters.location, filters.date]);

    return (
        <div className="issues-container">
            <h2>Reported Issues</h2>

            <div className="filter-controls">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by title, location, or category"
                    value={filters.search}
                    onChange={handleFilterChange}
                />

                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>

                <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                >
                    <option value="">All Categories</option>
                    <option value="Road">Road</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Street Light">Street Light</option>
                    <option value="Drainage">Drainage</option>
                    <option value="Other">Other</option>
                </select>

                <input
                    type="text"
                    name="location"
                    placeholder="Filter by location"
                    value={filters.location}
                    onChange={handleFilterChange}
                />

                <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                />
            </div>

            {issues.length === 0 ? (
                <p className="no-issues">No Issues Found</p>
            ) : (
                <div className="issues-grid">
                    {issues.map((issue) => (
                        <div className="issue-card" key={issue.id}>
                            <h3>{issue.title}</h3>

                            <p><strong>Description:</strong> {issue.description}</p>
                            <p><strong>Location:</strong> {issue.location}</p>
                            <p><strong>Category:</strong> {issue.category}</p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {issue.status === "Resolved" ? (
                                    <span className="status resolved-badge">Resolved ✓</span>
                                ) : issue.status === "In Progress" ? (
                                    <span className="status progress-badge">In Progress</span>
                                ) : (
                                    <span className="status pending-badge">Pending</span>
                                )}
                            </p>

                            <p>
                                <strong>Reported:</strong>{" "}
                                {issue.createdDate
                                    ? new Date(issue.createdDate).toLocaleString()
                                    : "N/A"}
                            </p>

                            {issue.updatedDate && (
                                <p>
                                    <strong>Updated:</strong>{" "}
                                    {new Date(issue.updatedDate).toLocaleString()}
                                </p>
                            )}

                            <div className="issue-image-wrapper">
                                {issue.imagePath ? (
                                    <img
                                        src={`http://localhost:8080${issue.imagePath}`}
                                        alt={issue.title}
                                        className="issue-image"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="issue-image-placeholder">
                                        No image available
                                    </div>
                                )}
                            </div>

                            <div className="button-group">
                                <button
                                    className="details-btn"
                                    onClick={() => navigate(`/issues/${issue.id}`)}
                                >
                                    View Details
                                </button>

                                {user?.role === "ADMIN" && (
                                    <>
                                        <button
                                            className="edit-btn"
                                            onClick={() => openEditForm(issue)}
                                        >
                                            Edit
                                        </button>

                                        {issue.status !== "Resolved" && (
                                            <button
                                                className="update-btn"
                                                onClick={() =>
                                                    updateStatus(issue.id, issue.status)
                                                }
                                            >
                                                Update Status
                                            </button>
                                        )}

                                        <button
                                            className="delete-btn"
                                            onClick={() => requestDelete(issue.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingIssue && (
                <div className="edit-modal">
                    <div className="edit-card">
                        <h2>Edit Issue</h2>

                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={formData.title}
                            onChange={handleChange}
                        />

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            value={formData.location}
                            onChange={handleChange}
                        />

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="Road">Road</option>
                            <option value="Garbage">Garbage</option>
                            <option value="Water Leakage">Water Leakage</option>
                            <option value="Street Light">Street Light</option>
                            <option value="Drainage">Drainage</option>
                            <option value="Other">Other</option>
                        </select>

                        <div className="modal-buttons">
                            <button className="save-btn" onClick={updateIssue}>
                                Save Changes
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() => setEditingIssue(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                message="Are you sure you want to delete this issue? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteModal({ isOpen: false, issueId: null })}
            />
        </div>
    );
}

export default ViewIssues;
