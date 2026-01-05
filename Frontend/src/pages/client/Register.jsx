import { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Spin } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "./../../services/api";

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API đăng ký
      const { data } = await api.post("/auth/register", values);

      // Đăng ký xong -> Lưu thông tin -> Tự động đăng nhập luôn
      localStorage.setItem("userInfo", JSON.stringify(data));
      message.success("Đăng ký thành công! Chào mừng bạn 🎉");

      navigate("/"); // Chuyển thẳng về Dashboard
      window.location.reload(); // Reload để cập nhật Header
    } catch (error) {
      message.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Title level={2} style={{ color: "#1890ff" }}>
            Đăng Ký
          </Title>
          <Text type="secondary">Tạo tài khoản để bắt đầu lên kế hoạch</Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và tên của bạn" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập Email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng Ký Ngay
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
