import axios from "axios";

import { clearAdminToken, getAdminToken } from "./auth";

// Địa chỉ backend — cấu hình qua biến môi trường VITE_API_BASE_URL (xem .env.example ở gốc repo).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Route công khai: không gửi kèm JWT quản trị.
const PUBLIC_PATHS = new Set(["/login", "/login/verify-otp", "/admin/login"]);

// Đính JWT quản trị (nếu có) vào mọi request tới route quản trị.
apiClient.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token && !PUBLIC_PATHS.has(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token hết hạn hoặc không còn hợp lệ (vd backend khởi động lại với khoá JWT mới) -> xoá token, về trang đăng nhập quản
// trị. Chỉ áp dụng khi request bị 401 có mang token, để lỗi 401 "sai mật khẩu" ở /login không đăng xuất quản trị viên.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      clearAdminToken();
      window.location.assign("/admin/login");
    }
    return Promise.reject(error);
  },
);
