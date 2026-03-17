import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
});

// Add a request interceptor
instance.interceptors.request.use(
    async function (config) {
        // Do something before request is sent
        // config.headers["delay"] = 3000
        const access_token = await localStorage.getItem('access_token');
        // console.log('>>> access_token:', access_token);
        config.headers['Authorization'] = `Bearer ${access_token}`;
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    },
);
// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response.data;
    },
    function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Rather than rejecting with error, return the error data so login.tsx can handle it
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return Promise.reject(error);
    },
);

export default instance;
