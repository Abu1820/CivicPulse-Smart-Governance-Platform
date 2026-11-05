import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import IssueLocationMap from "../components/IssueLocationMap";
import "../styles/IssueDetails.css";

function IssueDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIssue();
    }, [id]);

    const fetchIssue = async () => {
        try {
            const response = await api.get(`/issues/${id}`);
            setIssue(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch issue details");
            navigate("/issues");
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (status === "Resolved") return "status resolved-badge";
        if (status === "In Progress") return "status progress-badge";
        return "status pending-badge";
    };

    if (loading) {
        return (
            <div className="details-container">
                <div className="details-card">
                    <p style={{ textAlign: "center", color: "#64748b" }}>Loading issue details...</p>
                </div>
            </div>
        );
    }

    if (!issue) return null;

    const hasCoords = Boolean(issue.latitude && issue.longitude);
    const googleMapsUrl = hasCoords
        ? `https://www.google.com/maps/search/?api=1&query=${issue.latitude},${issue.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.location)}`;

    return (
        <div className="details-container">
            <div className="details-card">
                <h2>Issue Details</h2>

                <p><strong>Title:</strong> {issue.title}</p>
                <p><strong>Description:</strong> {issue.description}</p>
                <p className="detail-location-row">
                    <strong>Location:</strong> {issue.location}
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-maps-link"
                        title="View in Google Maps"
                    >
                        📍 Open in Maps ↗
                    </a>
                </p>
                <p><strong>Category:</strong> {issue.category}</p>
                <p>
                    <strong>Status:</strong>{" "}
                    <span className={getStatusClass(issue.status)}>{issue.status}</span>
                </p>
                <p>
                    <strong>Reported:</strong>{" "}
                    {issue.createdDate
                        ? new Date(issue.createdDate).toLocaleString()
                        : "N/A"}
                </p>
                {issue.updatedDate && (
                    <p>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(issue.updatedDate).toLocaleString()}
                    </p>
                )}

                {/* Interactive Map if coordinates exist */}
                {hasCoords && (
                    <IssueLocationMap
                        latitude={issue.latitude}
                        longitude={issue.longitude}
                        title={issue.title}
                        location={issue.location}
                    />
                )}

                <div className="detail-image-wrapper">
                    {issue.imagePath ? (
                        <img
                            src={`http://localhost:8080${issue.imagePath}`}
                            alt={issue.title}
                            className="detail-image"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="detail-image-placeholder">No image available</div>
                    )}
                </div>

                <button className="back-btn" onClick={() => navigate("/issues")}>
                    ← Back to Issues
                </button>
            </div>
        </div>
    );
}

export default IssueDetails;
