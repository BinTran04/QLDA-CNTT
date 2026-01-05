import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Typography,
  Timeline,
  Button,
  Tag,
  Empty,
  Row,
  Col,
  Avatar,
  message,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import api from "./../../services/api";
import moment from "moment";

const { Title, Text } = Typography;

const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTripDetail = async () => {
    try {
      const { data } = await api.get(`/itineraries/${id}`);
      setTrip(data);
    } catch (error) {
      message.error("Không tìm thấy chuyến đi!");
      navigate("/my-trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetail();
  }, [id, navigate]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  if (!trip)
    return (
      <Empty description="Không tìm thấy dữ liệu" style={{ marginTop: 100 }} />
    );

  // --- PHẦN MỚI: CHUẨN BỊ DỮ LIỆU CHO TIMELINE (ANTD 5.x) ---
  const timelineItems = [
    // 1. Điểm bắt đầu
    {
      color: "green",
      dot: (
        <Avatar
          style={{ backgroundColor: "#52c41a" }}
          icon={<EnvironmentOutlined />}
        />
      ),
      children: (
        <>
          <Title level={5} style={{ margin: 0, color: "#52c41a" }}>
            Bắt đầu hành trình
          </Title>
          <Text type="secondary">Hãy chuẩn bị hành lý sẵn sàng!</Text>
          <div style={{ height: 20 }}></div>
        </>
      ),
    },
    // 2. Danh sách địa điểm (Dùng map để tạo ra các item ở giữa)
    ...(trip.places && trip.places.length > 0
      ? trip.places.map((place, index) => ({
          color: "blue",
          dot: (
            <Avatar style={{ backgroundColor: "#1890ff" }}>{index + 1}</Avatar>
          ),
          children: (
            <Card
              hoverable
              style={{
                borderRadius: 12,
                overflow: "hidden",
                borderLeft: "5px solid #1890ff",
                marginBottom: 10,
              }}
              styles={{ body: { padding: 0 } }}
            >
              <Row>
                <Col xs={24} sm={8}>
                  <Image
                    alt={place.name}
                    src={place.image || "https://placehold.co/600x400"}
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={16}
                  style={{
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    {place.name}
                  </Title>
                  <div style={{ marginBottom: 10, color: "#666" }}>
                    <EnvironmentOutlined /> {place.address}
                  </div>
                  <div>
                    <Tag color="blue">{place.category}</Tag>
                  </div>
                </Col>
              </Row>
            </Card>
          ),
        }))
      : [
          {
            // Trường hợp chưa có địa điểm
            color: "gray",
            children: (
              <Card style={{ background: "#fafafa", borderStyle: "dashed" }}>
                <Empty description="Chưa có địa điểm nào trong lịch trình" />
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <Button type="primary" onClick={() => navigate("/places")}>
                    Đi chọn địa điểm ngay
                  </Button>
                </div>
              </Card>
            ),
          },
        ]),
    // 3. Điểm kết thúc
    {
      color: "red",
      dot: <Avatar style={{ backgroundColor: "#f5222d" }}>End</Avatar>,
      children: (
        <>
          <Title level={5} style={{ margin: 0, color: "#f5222d" }}>
            Kết thúc chuyến đi
          </Title>
          <Text type="secondary">Hẹn gặp lại trong chuyến đi sau.</Text>
        </>
      ),
    },
  ];
  // -----------------------------------------------------------

  return (
    <div style={{ paddingBottom: 50 }}>
      {/* HEADER & COVER IMAGE */}
      <div style={{ position: "relative", marginBottom: 80 }}>
        <div
          style={{
            height: 300,
            background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "0 0 30px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <h1
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 60,
              fontWeight: "bold",
              letterSpacing: "5px",
              margin: 0,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            TRIP PLANNER
          </h1>
        </div>

        <Card
          style={{
            width: "90%",
            margin: "-80px auto 0",
            borderRadius: 15,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/my-trips")}
              >
                Quay lại
              </Button>
              <Title level={2} style={{ margin: "10px 0" }}>
                {trip.title}
              </Title>
              <div style={{ display: "flex", gap: 20, color: "#666" }}>
                <span>
                  <CalendarOutlined />{" "}
                  {moment(trip.startDate).format("DD/MM/YYYY")} -{" "}
                  {moment(trip.endDate).format("DD/MM/YYYY")}
                </span>
                <span>
                  <EnvironmentOutlined /> {trip.places?.length || 0} địa điểm
                </span>
              </div>
            </div>
            <div>
              <Button type="primary" icon={<EditOutlined />}>
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* TIMELINE HIỂN THỊ ITEM */}
      <Row justify="center">
        <Col xs={24} md={20} lg={16}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              📍 Lộ trình dự kiến
            </Title>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => navigate("/places")}
            >
              Thêm địa điểm khác
            </Button>
          </div>

          {/* Thay vì viết Timeline.Item, ta truyền prop items vào đây */}
          <Timeline items={timelineItems} />
        </Col>
      </Row>
    </div>
  );
};

export default ItineraryDetail;
