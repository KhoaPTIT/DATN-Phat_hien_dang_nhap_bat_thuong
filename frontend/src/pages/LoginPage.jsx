import { useState } from "react";

import { apiClient } from "../services/api";
import "./AuthForm.css";

// Form đăng nhập người dùng (POST /login, docs/api-contract.md). Không có trang đích phía sau nên kết quả hiển thị tại chỗ.
// Rủi ro trung bình: backend trả step_up_required=true (HTTP 200, mật khẩu đã đúng) -> chuyển sang bước OTP.
// Rủi ro cao hoặc nguồn đang bị khoá: backend trả HTTP 423, đi qua nhánh lỗi chung.
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Bước OTP giả lập, chỉ dùng khi step_up_required=true.
  const [challenge, setChallenge] = useState(null); // { id, demoCode }
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  function resetToCredentials() {
    setChallenge(null);
    setOtpCode("");
    setOtpError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiClient.post("/login", { username, password });
      if (response.data.step_up_required) {
        setChallenge({ id: response.data.challenge_id, demoCode: response.data.demo_otp_code });
      } else if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || "Đăng nhập thất bại.");
      }
    } catch (err) {
      if (err.response) {
        // Gồm cả HTTP 423 (bị khoá tạm): hiển thị nguyên message của backend.
        setError(err.response.data?.message || "Đăng nhập thất bại.");
      } else {
        setError("Không kết nối được tới máy chủ. Kiểm tra backend đã chạy chưa.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setOtpLoading(true);
    setOtpError(null);

    try {
      const response = await apiClient.post("/login/verify-otp", { challenge_id: challenge.id, code: otpCode });
      if (response.data.success) {
        setChallenge(null);
        setSuccess(true);
      } else {
        setOtpError(response.data.message || "Mã xác thực không đúng hoặc đã hết hạn.");
        setOtpCode("");
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Không kết nối được tới máy chủ.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Đăng nhập</h1>

        {challenge ? (
          <form onSubmit={handleVerifyOtp}>
            <p className="auth-otp-banner">
              ⚠️ <strong>OTP giả lập (demo)</strong> — hệ thống thật sẽ gửi mã qua SMS/email, không bao giờ hiện trực
              tiếp như thế này. Mã demo: <strong>{challenge.demoCode}</strong>
            </p>
            <div className="auth-field">
              <label htmlFor="otp">Mã xác thực (6 số)</label>
              <input
                id="otp"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={12}
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                autoFocus
                required
              />
            </div>

            {otpError && (
              <p className="auth-error" role="alert">
                {otpError}
              </p>
            )}

            <button type="submit" disabled={otpLoading}>
              {otpLoading ? "Đang xác thực..." : "Xác thực"}
            </button>
            <button type="button" className="auth-secondary" onClick={resetToCredentials}>
              Huỷ, đăng nhập lại
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            {success && <p className="auth-success">Đăng nhập thành công.</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
