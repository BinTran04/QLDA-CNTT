import { useEffect, useState } from "react";
import { Typography, Card, Row, Col, Statistic } from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import dayjs from "dayjs";

// Import biểu đồ
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [chartData, setChartData] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get("/bookings");

      // 1. Tính tổng quan
      const totalRevenue = data.reduce(
        (acc, curr) => acc + (curr.totalPrice || 0),
        0
      );
      const totalBookings = data.length;

      // 2. Xử lý dữ liệu biểu đồ
      const revenueMap = {};
      data.forEach((booking) => {
        const date = dayjs(booking.createdAt).format("DD/MM");
        if (!revenueMap[date]) revenueMap[date] = 0;
        revenueMap[date] += booking.totalPrice || 0;
      });

      const chartArray = Object.keys(revenueMap).map((key) => ({
        name: key,
        DoanhThu: revenueMap[key],
      }));

      setStats({
        totalBookings,
        totalRevenue,
        totalUsers: 5, // Hardcode tạm
      });
      setChartData(chartArray);
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>
        📊 Tổng quan hoạt động
      </Title>

      {/* SỐ LIỆU THỐNG KÊ */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#e6f7ff" }}>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#f6ffed" }}>
            <Statistic
              title="Số đơn đặt vé"
              value={stats.totalBookings}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#fff7e6" }}>
            <Statistic
              title="Khách hàng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* BIỂU ĐỒ DOANH THU */}
      <Card title="Biểu đồ doanh thu theo ngày" bordered={false}>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString() + "đ"} />
              <Legend />
              <Area
                type="monotone"
                dataKey="DoanhThu"
                stroke="#1890ff"
                fill="#e6f7ff"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
