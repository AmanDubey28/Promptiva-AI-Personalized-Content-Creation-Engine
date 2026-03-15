import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api"
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Auth endpoints
export const register = async (email, username, password, passwordConfirm) => {
    const response = await api.post("/auth/register", {
        email,
        username,
        password,
        password_confirm: passwordConfirm
    });
    return response.data;
};

export const login = async (username, password) => {
    const response = await api.post("/auth/login", {
        username,
        password
    });
    return response.data;
};

export const verifyToken = async (token) => {
    const response = await api.post("/auth/verify", null, {
        params: { token }
    });
    return response.data;
};

// Generation endpoints
export const generateContent = async (userInput, compare = false) => {
    const response = await api.post("/generate", {
        user_input: userInput,
        compare
    });
    return response.data;
};

export const getHistory = async () => {
    const response = await api.get("/history");
    return response.data;
};

export const getGeneration = async (generationId) => {
    const response = await api.get(`/history/${generationId}`);
    return response.data;
};

// Auth helper functions
export const setAuthToken = (token) => {
    localStorage.setItem("access_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const getAuthToken = () => {
    return localStorage.getItem("access_token");
};

export const clearAuthToken = () => {
    localStorage.removeItem("access_token");
    delete api.defaults.headers.common["Authorization"];
};

export const isAuthenticated = () => {
    return !!getAuthToken();
};