import axios from "axios";

export const SERVER_BASE = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
    : "http://localhost:8080";

const API_BASE = `${SERVER_BASE}/api`;

export function getImageUrl(imagePath) {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${SERVER_BASE}${cleanPath}`;
}

const api = axios.create({
    baseURL: API_BASE,
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401 Unauthorized / Token Expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
