import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/IssueDetails.css";

function IssueDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);

    useEffect(() => {

        fetchIssue();

    }, []);

    const fetchIssue = async () => {

        try {

            const response = await api.get(
                `/issues/${id}`
            );

            setIssue(response.data);

        } catch (error) {

            console.error(error);

            alert("Failed to fetch issue details");

        }

    };

    if (!issue) {

        return (
            <div className="details-container">
                <h2>Loading...</h2>
            </div>
        );

    }

    return (

        <div className="details-container">

            <div className="details-card">

                <h2>Issue Details</h2>

                <p>
                    <strong>Title:</strong> {issue.title}
                </p>

                <p>
                    <strong>Description:</strong> {issue.description}
                </p>

                <p>
                    <strong>Location:</strong> {issue.location}
                </p>

                <p>
                    <strong>Category:</strong> {issue.category}
                </p>

                <p>
                    <strong>Status:</strong> {issue.status}
                </p>

                <p>
                    <strong>Created:</strong>{" "}
                    {issue.createdDate
                        ? new Date(issue.createdDate).toLocaleString()
                        : "N/A"}
                </p>

                <div className="detail-image-wrapper">
                    {issue.imagePath ? (
                        <img
                            src={`http://localhost:8080${issue.imagePath}`}
                            alt={issue.title}
                            className="detail-image"
                        />
                    ) : (
                        <div className="detail-image-placeholder">
                            No image available
                        </div>
                    )}
                </div>

                <button
                    className="back-btn"
                    onClick={() => navigate("/issues")}
                >
                    Back
                </button>

            </div>

        </div>

    );

}

export default IssueDetails;