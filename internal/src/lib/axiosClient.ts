import axios, { AxiosHeaders } from "axios";

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
    if (token) {
        config.headers = config.headers ?? new AxiosHeaders();
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

export default axiosClient;
