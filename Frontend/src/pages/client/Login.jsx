import { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "./../../services/api"; // Import file gọi API chúng ta đã tạo

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi người dùng bấm nút Đăng nhập
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Gửi request đăng nhập lên Server
      const { data } = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      // 2. Nếu thành công: Lưu thông tin user + token vào bộ nhớ trình duyệt
      localStorage.setItem("userInfo", JSON.stringify(data));

      message.success("Đăng nhập thành công! 🚀");

      // 3. Chuyển hướng về trang Dashboard và tải lại trang để cập nhật Header
      window.location.href = "/";
    } catch (error) {
      // 4. Nếu lỗi: Hiện thông báo
      const errorMsg = error.response?.data?.message || "Đăng nhập thất bại";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Title level={2}>Đăng nhập</Title>
          <p>Chào mừng bạn quay lại với TripPlanner</p>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập Email!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
