import { Layout, Menu, Button, Dropdown, Space, Avatar } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  EnvironmentOutlined,
  ScheduleOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
    window.location.reload();
  };

  const items = [
    { key: "/", label: <Link to="/">Trang chủ</Link>, icon: <HomeOutlined /> },
    {
      key: "/places",
      label: <Link to="/places">Điểm đến</Link>,
      icon: <EnvironmentOutlined />,
    },
    {
      key: "/my-trips",
      label: <Link to="/my-trips">Lịch trình</Link>,
      icon: <ScheduleOutlined />,
    },
  ];

  const userMenu = {
    items: [
      ...(user && user.isAdmin
        ? [
            {
              key: "admin",
              label: <Link to="/admin">Vào trang Quản trị</Link>,
              icon: <DashboardOutlined style={{ color: "#1890ff" }} />,
            },
            { type: "divider" },
          ]
        : []),
      {
        key: "profile",
        label: <Link to="/profile">Hồ sơ của tôi</Link>,
        icon: <UserOutlined />,
      },
      {
        key: "messages",
        label: (
          <Link to={user && user.isAdmin ? "/admin/messages" : "/my-messages"}>
            Tin nhắn của tôi
          </Link>
        ),
        icon: <MessageOutlined />,
      },
      { type: "divider" },
      {
        key: "logout",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: "80px",
        background: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          color: "#1890ff",
          fontSize: "28px",
          fontWeight: "900",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        ✈️ TripPlanner
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        style={{
          flex: 1,
          borderBottom: "none",
          background: "transparent",
          lineHeight: "78px",
        }}
      />
      <div>
        {user ? (
          <Dropdown menu={userMenu} arrow>
            <Space
              style={{
                cursor: "pointer",
                padding: "5px 15px",
                borderRadius: 20,
                background: "#f5f5f5",
              }}
            >
              <Avatar
                src={user.avatar}
                icon={!user.avatar && <UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <span style={{ color: "#333", fontWeight: "600" }}>
                {user.name}
              </span>
            </Space>
          </Dropdown>
        ) : (
          <Link to="/login">
            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<LoginOutlined />}
            >
              Đăng nhập
            </Button>
          </Link>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;
