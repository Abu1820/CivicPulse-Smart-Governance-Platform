import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import api from "../api/axiosConfig";
import "../styles/AdminDashboard.css";

const STATUS_COLORS = {
    Pending: "#f59e0b",
    "In Progress": "#3b82f6",
    Resolved: "#10b981",
};

const CATEGORY_COLORS = ["#0ea5e9", "#8b5cf6", "#f43f5e", "#f59e0b", "#10b981", "#64748b"];

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalIssues: 0,
        pendingIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        categoryStats: {},
    });
    const [issues, setIssues] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get("/issues/dashboard/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        }
    };

    const fetchRecentIssues = async (currentSearch = search, currentStatus = statusFilter) => {
        try {
            const params = new URLSearchParams();
            if (currentSearch) params.append("search", currentSearch);
            if (currentStatus && currentStatus !== "All") params.append("status", currentStatus);

            const response = await api.get(
                `/issues${params.toString() ? `?${params.toString()}` : ""}`
            );
            setIssues(response.data);
        } catch (error) {
            console.error("Failed to load issues", error);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
        fetchRecentIssues(search, statusFilter);
    }, [search, statusFilter]);

    // Build pie chart data
    const pieData = [
        { name: "Pending", value: Number(stats.pendingIssues) || 0 },
        { name: "In Progress", value: Number(stats.inProgressIssues) || 0 },
        { name: "Resolved", value: Number(stats.resolvedIssues) || 0 },
    ].filter((d) => d.value > 0);

    // Build bar chart data from categoryStats
    const barData = Object.entries(stats.categoryStats || {}).map(([name, count]) => ({
        name,
        count: Number(count),
    }));

    return (
        <div className="dashboard-container">
            <h2>Admin Dashboard</h2>

            {/* Stat Cards */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Total Issues</h3>
                    <h1>{stats.totalIssues}</h1>
                </div>
                <div className="dashboard-card pending">
                    <h3>Pending</h3>
                    <h1>{stats.pendingIssues}</h1>
                </div>
                <div className="dashboard-card progress">
                    <h3>In Progress</h3>
                    <h1>{stats.inProgressIssues}</h1>
                </div>
                <div className="dashboard-card resolved">
                    <h3>Resolved</h3>
                    <h1>{stats.resolvedIssues}</h1>
                </div>
            </div>

            {/* Visual Analytics with Recharts */}
            <div className="charts-section">
                {/* Status Donut/Pie Chart */}
                <div className="chart-card">
                    <h3>Status Breakdown</h3>
                    {pieData.length > 0 ? (
                        <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 25, right: 25, bottom: 10, left: 25 }}>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="48%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={5}
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
                    ) : (
                        <p className="chart-empty">No status data available yet</p>
                    )}
                </div>

                {/* Category Bar Chart */}
                <div className="chart-card">
                    <h3>Issues by Category</h3>
                    {barData.length > 0 ? (
                        <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 25, right: 20, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {barData.map((_, index) => (
                                            <Cell
                                                key={`bar-${index}`}
                                                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="chart-empty">No category data available yet</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button onClick={() => navigate("/issues")}>View All Issues</button>
                    <button onClick={() => navigate("/profile")}>My Profile</button>
                </div>
            </div>

            {/* Filter Container */}
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Search issues..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option>All</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                </select>
            </div>

            {/* Recent Issues Table */}
            <div className="recent-issues">
                <h2>Recent Issues</h2>
                <div className="table-responsive-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Reported</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.length === 0 ? (
                                <tr>
                                    <td colSpan="5">No Issues Found</td>
                                </tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr
                                        key={issue.id}
                                        onClick={() => navigate(`/issues/${issue.id}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{issue.title}</td>
                                        <td>{issue.category}</td>
                                        <td>{issue.location}</td>
                                        <td>
                                            <span
                                                className={
                                                    issue.status === "Pending"
                                                        ? "status pending-badge"
                                                        : issue.status === "In Progress"
                                                        ? "status progress-badge"
                                                        : "status resolved-badge"
                                                }
                                            >
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td>
                                            {issue.createdDate
                                                ? new Date(issue.createdDate).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
