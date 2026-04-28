import axios, { AxiosHeaders } from "axios";
import { authPaths } from "@/services/authPaths";

const PUBLIC_AUTH_PATHS = [
    authPaths.login,
    authPaths.register,
    authPaths.refresh,
];

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    const url = config.url ?? "";
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

    if (token && !isPublicAuthRequest) {
        config.headers = config.headers ?? new AxiosHeaders();
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

export default axiosClient;
