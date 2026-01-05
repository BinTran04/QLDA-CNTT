import { useEffect, useState } from "react";
import {
  Tabs,
  Card,
  Tag,
  Typography,
  Button,
  Spin,
  Row,
  Col,
  Empty,
  message,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  QrcodeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"; // Thư viện xử lý ngày tháng (đã có sẵn khi cài antd)

const { Title, Text } = Typography;

const MyTrips = () => {
  const [itineraries, setItineraries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Gọi API lấy Lịch trình
        const resItineraries = await api.get("/itineraries");
        setItineraries(resItineraries.data);

        // 2. [SỬA DÒNG NÀY]: Gọi đúng API lấy vé của CÁ NHÂN (my-bookings)
        // Thay vì "/bookings" (của admin) -> đổi thành "/bookings/my-bookings"
        const resBookings = await api.get("/bookings/my-bookings");

        setBookings(resBookings.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- COMPONENT CON: DANH SÁCH VÉ (BOOKING) ---
  const BookingList = ({ list }) => {
    if (!list || list.length === 0)
      return <Empty description="Bạn chưa đặt vé nào" />;

    return (
      <Row gutter={[16, 16]}>
        {list.map((item) => (
          <Col xs={24} md={12} lg={8} key={item._id}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #d9d9d9",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ padding: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Tag color={item.status === "Confirmed" ? "green" : "orange"}>
                    {item.status === "Confirmed" ? "ĐÃ XÁC NHẬN" : "CHỜ XỬ LÝ"}
                  </Tag>
                  <Text strong type="secondary">
                    #{item._id.slice(-6).toUpperCase()}
                  </Text>
                </div>

                {/* Thông tin vé */}
                <div style={{ display: "flex", gap: 15 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.place?.image || "https://placehold.co/100"}
                      alt="place"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {item.place?.name || "Vé tham quan"}
                    </Title>
                    <div style={{ marginTop: 5 }}>
                      <Text
                        type="secondary"
                        style={{ display: "block", fontSize: 13 }}
                      >
                        <CalendarOutlined /> Ngày đi:{" "}
                        {dayjs(item.bookingDate).format("DD/MM/YYYY")}
                      </Text>
                      <Text
                        type="secondary"
                        style={{ display: "block", fontSize: 13 }}
                      >
                        <QrcodeOutlined /> Số lượng: {item.quantity} khách
                      </Text>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 15,
                    paddingTop: 15,
                    borderTop: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Tổng tiền:</Text>
                  <Title level={4} style={{ margin: 0, color: "#ff4d4f" }}>
                    {item.totalPrice?.toLocaleString()}₫
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // --- COMPONENT CON: DANH SÁCH LỊCH TRÌNH (PLAN) ---
  const ItineraryList = ({ list }) => {
    if (!list || list.length === 0)
      return <Empty description="Chưa có lịch trình nào" />;

    return (
      <Row gutter={[16, 16]}>
        {list.map((item) => (
          <Col xs={24} md={12} lg={8} key={item._id}>
            <Card
              title={item.title || "Chuyến đi chưa đặt tên"}
              extra={<Tag color="blue">Sắp tới</Tag>}
              actions={[
                <Button
                  type="link"
                  onClick={() => navigate(`/itineraries/${item._id}`)}
                >
                  Xem chi tiết
                </Button>,
                <Button type="link" danger>
                  Xóa
                </Button>,
              ]}
            >
              <p>
                <CalendarOutlined /> Ngày đi:{" "}
                {dayjs(item.startDate).format("DD/MM/YYYY")}
              </p>
              <p>
                <ClockCircleOutlined /> Ngày về:{" "}
                {dayjs(item.endDate).format("DD/MM/YYYY")}
              </p>
              <p>
                <EnvironmentOutlined /> Địa điểm: {item.places?.length || 0} nơi
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // --- CẤU HÌNH TAB ---
  const tabItems = [
    // {
    //   key: "1",
    //   label: <span>📅 Lịch trình tự túc</span>,
    //   children: <ItineraryList list={itineraries} />,
    // },
    {
      key: "2",
      label: <span>🎟️ Vé đã đặt (Booking)</span>, // Tab mới chứa vé của bạn
      children: <BookingList list={bookings} />,
    },
  ];

  return (
    <div
      style={{ padding: "20px 50px", minHeight: "80vh", background: "#f5f7fa" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Title level={2}>🎒 Vali của tôi</Title>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="2" items={tabItems} type="card" size="large" />
      )}
    </div>
  );
};

export default MyTrips;
