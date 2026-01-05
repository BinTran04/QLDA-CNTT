import { Layout, Row, Col, Typography, Space } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Footer } = Layout;
const { Title, Text } = Typography;

const AppFooter = () => {
  return (
    <Footer
      style={{
        background: "#001529",
        color: "#ffffff",
        padding: "60px 50px 20px",
      }}
    >
      <Row gutter={[32, 32]} justify="space-between">
        {/* CỘT 1: GIỚI THIỆU */}
        <Col xs={24} sm={12} md={6}>
          <Title level={3} style={{ color: "#1890ff", marginBottom: 20 }}>
            ✈️ TripPlanner
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.65)" }}>
            TripPlanner mang đến trải nghiệm du lịch thông minh, giúp bạn lên
            lịch trình và đặt vé tham quan dễ dàng chỉ trong vài cú nhấp chuột.
          </Text>
        </Col>

        {/* CỘT 2: LIÊN KẾT NHANH */}
        <Col xs={24} sm={12} md={5}>
          <Title level={5} style={{ color: "#fff", marginBottom: 20 }}>
            Khám phá
          </Title>
          <Space direction="vertical">
            <Link to="/" style={{ color: "rgba(255,255,255,0.65)" }}>
              Trang chủ
            </Link>
            <Link to="/places" style={{ color: "rgba(255,255,255,0.65)" }}>
              Điểm đến
            </Link>
            <Link to="/my-trips" style={{ color: "rgba(255,255,255,0.65)" }}>
              Lịch trình của tôi
            </Link>
          </Space>
        </Col>

        {/* CỘT 3: LIÊN HỆ */}
        <Col xs={24} sm={12} md={6}>
          <Title level={5} style={{ color: "#fff", marginBottom: 20 }}>
            Liên hệ
          </Title>
          <Space
            direction="vertical"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            <Text style={{ color: "inherit" }}>
              <EnvironmentOutlined /> 123 Đường ABC, Quận 1, TP. HCM
            </Text>
            <Text style={{ color: "inherit" }}>
              <PhoneOutlined /> +84 123 456 789
            </Text>
            <Text style={{ color: "inherit" }}>
              <MailOutlined /> support@tripplanner.com
            </Text>
          </Space>
        </Col>

        {/* CỘT 4: MẠNG XÃ HỘI */}
        <Col xs={24} sm={12} md={4}>
          <Title level={5} style={{ color: "#fff", marginBottom: 20 }}>
            Theo dõi chúng tôi
          </Title>
          <Space size="large" style={{ fontSize: 24 }}>
            <a href="#" style={{ color: "#fff" }}>
              <FacebookOutlined />
            </a>
            <a href="#" style={{ color: "#fff" }}>
              <InstagramOutlined />
            </a>
            <a href="#" style={{ color: "#fff" }}>
              <YoutubeOutlined />
            </a>
          </Space>
        </Col>
      </Row>

      <div
        style={{
          textAlign: "center",
          marginTop: 50,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.45)" }}>
          ©{new Date().getFullYear()} TripPlanner. All rights reserved. Designed
          with ❤️
        </Text>
      </div>
    </Footer>
  );
};

export default AppFooter;
