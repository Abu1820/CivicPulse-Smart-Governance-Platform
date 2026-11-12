import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ReportIssue = lazy(() => import("./pages/ReportIssue"));
const ViewIssues = lazy(() => import("./pages/ViewIssues"));
const IssueDetails = lazy(() => import("./pages/IssueDetails"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
    return (
        <div className="page-loading-spinner" role="status" aria-label="Loading page">
            <div className="spinner-ring" />
            <span>Loading...</span>
        </div>
    );
}

function App() {
    return (
        <>
            <Navbar />

            <main className="main-content-wrapper">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            path="/report"
                            element={
                                <ProtectedRoute>
                                    <ReportIssue />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/issues"
                            element={
                                <ProtectedRoute>
                                    <ViewIssues />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/issues/:id"
                            element={
                                <ProtectedRoute>
                                    <IssueDetails />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin-dashboard"
                            element={
                                <ProtectedRoute role="ADMIN">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
        </>
    );
}

export default App;
