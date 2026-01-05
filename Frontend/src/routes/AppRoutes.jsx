// File cấu hình Router chính
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages (User)
import Home from "./../pages/client/Home"; // Bạn nhớ cập nhật đúng đường dẫn nếu đã di chuyển file vào subfolder
import Login from "./../pages/client/Login";
import Register from "./../pages/client/Register";
import Places from "./../pages/client/Places";
import PlaceDetail from "../pages/client/PlaceDetail";
import MyTrips from "./../pages/client/MyTrips";
import ItineraryDetail from "./../pages/client/ItineraryDetail";
import Profile from "./../pages/client/Profile";
import UserMessages from "../pages/client/UserMessages";

// Pages (Admin)
import Dashboard from "./../pages/admin/Dashboard";
import AdminPlaces from "./../pages/admin/AdminPlaces";
import AdminMessages from "../pages/admin/AdminMessages";
import AdminOrders from "./../pages/admin/AdminOrders";

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- NHÓM 1: USER (Dùng MainLayout - Có Header/Footer) --- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/places" element={<Places />} />
        <Route path="/places/:id" element={<PlaceDetail />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/itineraries/:id" element={<ItineraryDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-messages" element={<UserMessages />} />
      </Route>

      {/* --- NHÓM 2: AUTH (Không có Layout hoặc Layout riêng) --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- NHÓM 3: ADMIN (Dùng AdminLayout + Được bảo vệ) --- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} /> {/* /admin */}
        <Route path="places" element={<AdminPlaces />} /> {/* /admin/places */}
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* Trang 404 (Nếu nhập linh tinh) */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
