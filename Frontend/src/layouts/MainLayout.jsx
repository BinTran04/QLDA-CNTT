// Layout cho Admin
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div>
      {/* Header luôn hiện ở đây */}
      <Header />

      {/* Outlet là nơi nội dung các trang con (Home, Places...) sẽ được render vào */}
      <div style={{ minHeight: "80vh" }}>
        <Outlet />
      </div>

      {/* Footer luôn hiện ở đây */}
      <Footer />
    </div>
  );
};

export default MainLayout;
