import { useEffect } from "react"; // Đã thêm useEffect
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  notification,
  Button,
} from "antd"; // Đã thêm notification và Button
import {
  DashboardOutlined,
  EnvironmentOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import io from "socket.io-client";

// Kết nối đến server socket
const socket = io.connect("http://localhost:5000");

const { Sider, Content, Header } = Layout;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // --- LOGIC LẮNG NGHE THÔNG BÁO (TÍCH HỢP TRỰC TIẾP) ---
  useEffect(() => {
    // Chỉ Admin mới kích hoạt lắng nghe thông báo
    if (user?.role === "admin") {
      socket.emit("admin_join");

      socket.on("admin_notification", (data) => {
        // 1. Phát âm thanh báo hiệu
        const audio = new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
        );
        audio
          .play()
          .catch((e) => console.log("Yêu cầu tương tác để phát nhạc"));

        // 2. Hiển thị thông báo góc màn hình (Ant Design Notification)
        notification.info({
          message: `💬 Tin nhắn từ ${data.user}`,
          description: `Khách đang hỏi tại: ${data.placeName}`,
          placement: "topRight",
          duration: 10,
          btn: (
            <Button
              type="primary"
              size="small"
              onClick={() => navigate(`/places/${data.placeId}`)}
            >
              Xem ngay
            </Button>
          ),
        });
      });
    }

    return () => {
      socket.off("admin_notification");
    };
  }, [user, navigate]);

  // Menu bên trái
  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Tổng quan</Link>,
    },
    {
      key: "/admin/places",
      icon: <EnvironmentOutlined />,
      label: <Link to="/admin/places">Quản lý Địa điểm</Link>,
    },
    {
      key: "/admin/orders", // <-- THÊM MỤC NÀY
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/orders">Quản lý Đơn hàng</Link>,
    },
    {
      key: "/admin/messages",
      icon: <MessageOutlined />,
      label: <Link to="/admin/messages">Trung tâm Tin nhắn</Link>,
    },
  ];

  // Menu Avatar góc phải trên
  const userMenu = {
    items: [
      {
        key: "home",
        icon: <HomeOutlined />,
        label: <Link to="/">Về trang chủ</Link>,
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        danger: true,
        onClick: () => {
          localStorage.removeItem("userInfo");
          navigate("/login");
        },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 1. THANH BÊN TRÁI (SIDER) */}
      <Sider width={250} theme="dark" collapsible>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            background: "#002140",
          }}
        >
          ✈️ Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ marginTop: 20 }}
        />
      </Sider>

      {/* 2. KHUNG BÊN PHẢI */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
          }}
        >
          <Dropdown menu={userMenu}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <span style={{ fontWeight: 500 }}>{user?.name || "Admin"}</span>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            borderRadius: 8,
            overflow: "initial",
          }}
        >
          {/* Nơi hiển thị các trang con của admin */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
