import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import "./App.css";
import AdminLoginPage from "./pages/AdminLoginPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CampaignsPage from "./pages/CampaignsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ModelHealthPage from "./pages/ModelHealthPage";
import RulesPage from "./pages/RulesPage";
import UserProfilePage from "./pages/UserProfilePage";
import { clearAdminToken, getAdminToken } from "./services/auth";

// Chỉ chặn UI khi chưa có token; chữ ký JWT không được kiểm ở client vì backend luôn xác thực lại mỗi request.
function RequireAdmin({ children }) {
  const token = getAdminToken();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function navLinkClass({ isActive }) {
  return isActive ? "active" : undefined;
}

// Header của trang đăng nhập người dùng: tách khỏi nav quản trị để không lộ điều hướng của công cụ giám sát nội bộ.
function SiteHeader() {
  return (
    <header className="site-header">
      <span className="site-header__brand">Anomaly Login Detection</span>
      <NavLink to="/admin/login" className="site-header__admin-link">
        Khu vực quản trị
      </NavLink>
    </header>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  if (!getAdminToken()) return null;
  return (
    <button
      type="button"
      className="app-nav__logout"
      onClick={() => {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
      }}
    >
      Đăng xuất
    </button>
  );
}

function AdminNav() {
  const isAuthenticated = Boolean(getAdminToken());
  return (
    <nav className="app-nav">
      <span className="app-nav__brand">🛡️ Anomaly Login Detection</span>
      {!isAuthenticated && (
        <NavLink to="/admin/login" className={navLinkClass}>
          Đăng nhập quản trị
        </NavLink>
      )}
      <NavLink to="/dashboard" className={navLinkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/dashboard/campaigns" className={navLinkClass}>
        Chiến dịch
      </NavLink>
      <NavLink to="/dashboard/rules" className={navLinkClass}>
        Luật
      </NavLink>
      <NavLink to="/dashboard/model-health" className={navLinkClass}>
        Mô hình
      </NavLink>
      <LogoutButton />
    </nav>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const isSiteRoute = pathname === "/login";

  return (
    <div>
      {isSiteRoute ? <SiteHeader /> : <AdminNav />}
      <div className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAdmin>
                <DashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard/campaigns"
            element={
              <RequireAdmin>
                <CampaignsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard/campaigns/:campaignId"
            element={
              <RequireAdmin>
                <CampaignDetailPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard/rules"
            element={
              <RequireAdmin>
                <RulesPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard/model-health"
            element={
              <RequireAdmin>
                <ModelHealthPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard/users/:userId"
            element={
              <RequireAdmin>
                <UserProfilePage />
              </RequireAdmin>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
