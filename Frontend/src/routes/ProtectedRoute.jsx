// Component bảo vệ (Chặn người lạ vào Admin)
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // Nếu là Admin -> Cho vào (hiển thị children)
  if (user && user.isAdmin) {
    return children;
  }

  // Nếu không phải -> Đuổi về trang chủ
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
