import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axiosConfig";
import "../styles/UserProfile.css";

const STATUS_COLORS = {
    Pending: "#f59e0b",
    "In Progress": "#3b82f6",
    Resolved: "#10b981",
};

function UserProfile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchMyIssues();
    }, []);

    const fetchMyIssues = async () => {
        try {
            const response = await api.get("/issues");
            setIssues(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your issues");
        } finally {
            setLoading(false);
        }
    };

    const totalIssues = issues.length;
    const pending = issues.filter((i) => i.status === "Pending").length;
    const inProgress = issues.filter((i) => i.status === "In Progress").length;
    const resolved = issues.filter((i) => i.status === "Resolved").length;

    const pieData = [
        { name: "Pending", value: pending },
        { name: "In Progress", value: inProgress },
        { name: "Resolved", value: resolved },
    ].filter((d) => d.value > 0);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user?.role === "ADMIN" ? (
                        <svg
                            className="avatar-icon"
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                        </svg>
                    ) : (
                        <svg
                            className="avatar-icon"
                            width="42"
                            height="42"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    )}
                </div>
                <div className="profile-info">
                    <h2>{user?.name}</h2>
                    <p className="profile-email">{user?.email}</p>
                    <span className={`profile-role ${user?.role === "ADMIN" ? "admin" : "user"}`}>
                        {user?.role}
                    </span>
                </div>
            </div>

            {user?.role !== "ADMIN" ? (
                <>
                    <div className="profile-stats">
                        <div className="profile-stat-card">
                            <h3>Total Reported</h3>
                            <h1>{totalIssues}</h1>
                        </div>
                        <div className="profile-stat-card pending">
                            <h3>Pending</h3>
                            <h1>{pending}</h1>
                        </div>
                        <div className="profile-stat-card progress">
                            <h3>In Progress</h3>
                            <h1>{inProgress}</h1>
                        </div>
                        <div className="profile-stat-card resolved">
                            <h3>Resolved</h3>
                            <h1>{resolved}</h1>
                        </div>
                    </div>

                    {pieData.length > 0 && (
                        <div className="profile-chart">
                            <h3>Your Issue Status Breakdown</h3>
                            <div style={{ width: "100%", height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 25, right: 25, bottom: 10, left: 25 }}>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="48%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} ${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="profile-actions">
                        <button onClick={() => navigate("/report")}>+ Report New Issue</button>
                        <button className="secondary" onClick={() => navigate("/issues")}>View My Issues</button>
                    </div>
                </>
            ) : (
                <div className="profile-actions">
                    <button onClick={() => navigate("/admin-dashboard")}>Go to Admin Dashboard</button>
                    <button className="secondary" onClick={() => navigate("/issues")}>Manage All Issues</button>
                </div>
            )}
        </div>
    );
}

export default UserProfile;
