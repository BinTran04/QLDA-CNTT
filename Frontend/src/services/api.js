import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Tự động nối với http://localhost:5000/api nhờ proxy
});

// Tự động gắn Token vào mọi yêu cầu gửi đi (nếu đã đăng nhập)
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
