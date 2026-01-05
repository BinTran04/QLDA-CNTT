import { useEffect, useState } from "react";
import {
  Carousel,
  Card,
  Button,
  Row,
  Col,
  Typography,
  Rate,
  Tag,
  Avatar,
  Input,
  DatePicker,
  Spin,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  SmileOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const { Title, Paragraph, Text } = Typography;

// --- CẤU HÌNH MÀU SẮC ---
const BG_WHITE = "#ffffff";
const BG_BLUE = "#e6f7ff";

const Home = () => {
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [places, setPlaces] = useState([]); // Dữ liệu cho lưới bên dưới
  const [bannerList, setBannerList] = useState([]); // Dữ liệu cho Banner chạy slide
  const [loading, setLoading] = useState(true);

  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // 1. GỌI API LẤY DỮ LIỆU THẬT
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data } = await api.get("/places");

        // A. Lấy 4 địa điểm đầu tiên làm Banner (Hoặc logic rating cao tùy bạn)
        setBannerList(data.slice(0, 4));

        // B. Lấy 8 địa điểm để hiện danh sách bên dưới
        setPlaces(data.slice(0, 8));
      } catch (error) {
        console.error("Lỗi tải dữ liệu Home:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // 2. XỬ LÝ TÌM KIẾM
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/places?search=${searchTerm}`);
    } else {
      navigate("/places"); // Nếu không nhập gì thì chuyển sang trang tất cả
    }
  };

  // Màn hình chờ khi đang tải
  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Đang tải cảnh đẹp..." />
      </div>
    );

  return (
    <div className="home-page">
      {/* 1. HERO BANNER + SEARCH BAR (DỮ LIỆU THẬT TỪ DB) */}
      <div style={{ position: "relative" }}>
        {/* Nếu chưa có dữ liệu thì hiện ảnh mẫu, có rồi thì map ra */}
        {bannerList.length > 0 ? (
          <Carousel autoplay effect="fade" autoplaySpeed={4000}>
            {bannerList.map((place) => (
              <div key={place._id}>
                <div
                  style={{
                    height: "650px", // Tăng chiều cao xíu cho hoành tráng
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url(${place.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/places/${place._id}`)} // Bấm vào banner chuyển sang chi tiết luôn
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "white",
                      marginTop: -80,
                      padding: "0 20px",
                    }}
                  >
                    <Tag
                      color="orange"
                      style={{
                        fontSize: 16,
                        padding: "5px 15px",
                        marginBottom: 15,
                      }}
                    >
                      <EnvironmentOutlined /> {place.country}
                    </Tag>
                    <Title
                      style={{
                        color: "white",
                        fontSize: "clamp(30px, 5vw, 60px)", // Chữ co giãn theo màn hình
                        textShadow: "2px 2px 10px rgba(0,0,0,0.7)",
                        margin: "10px 0",
                      }}
                    >
                      {place.name}
                    </Title>
                    <Paragraph
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: 20,
                        maxWidth: 800,
                        textShadow: "1px 1px 5px rgba(0,0,0,0.8)",
                      }}
                      ellipsis={{ rows: 2 }} // Cắt ngắn nếu dài quá
                    >
                      {place.description}
                    </Paragraph>
                    <Button
                      type="primary"
                      size="large"
                      shape="round"
                      ghost
                      style={{ marginTop: 20, fontWeight: "bold" }}
                    >
                      KHÁM PHÁ NGAY
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          /* FALLBACK: Nếu Admin chưa nhập gì thì hiện cái này đỡ trống */
          <div
            style={{
              height: "600px",
              background: "#ccc",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Title level={3}>
              Chưa có dữ liệu. Vui lòng thêm địa điểm trong Admin.
            </Title>
          </div>
        )}

        {/* FLOATING SEARCH BAR (ĐÃ KÍCH HOẠT CHỨC NĂNG) */}
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "1000px",
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            zIndex: 10,
            display: "flex",
            gap: 15,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 3, minWidth: 200 }}>
            <Text strong style={{ marginLeft: 5 }}>
              Điểm đến
            </Text>
            <Input
              size="large"
              placeholder="Bạn muốn đi đâu? (Hà Nội, Đà Nẵng...)"
              prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              style={{ borderRadius: 8 }}
            />
          </div>
          <div style={{ flex: 2, minWidth: 150 }}>
            <Text strong style={{ marginLeft: 5 }}>
              Ngày đi (Dự kiến)
            </Text>
            <DatePicker
              size="large"
              style={{ width: "100%", borderRadius: 8 }}
              placeholder="Chọn ngày"
            />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <Button
              type="primary"
              size="large"
              block
              style={{ height: 40, fontSize: 16, borderRadius: 8 }}
              onClick={handleSearch}
            >
              TÌM KIẾM
            </Button>
          </div>
        </div>
      </div>

      {/* Khoảng trống đệm */}
      <div style={{ height: 100, background: BG_WHITE }}></div>

      {/* 2. GIỚI THIỆU NGẮN (Tĩnh - Giữ nguyên cho đẹp) */}
      <div style={{ padding: "0 20px 60px", background: BG_WHITE }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <Title level={2} style={{ color: "#1890ff" }}>
            Tại sao chọn TripPlanner?
          </Title>
          <Paragraph
            type="secondary"
            style={{ fontSize: 16, marginBottom: 40 }}
          >
            Chúng tôi cung cấp giải pháp toàn diện giúp bạn lên kế hoạch, quản
            lý chi phí và lưu giữ kỷ niệm cho mọi chuyến đi.
          </Paragraph>
          <Row justify="center" gutter={[40, 40]}>
            <Col xs={24} md={8}>
              <SafetyCertificateOutlined
                style={{ fontSize: 40, color: "#52c41a" }}
              />
              <Title level={4}>An toàn & Tin cậy</Title>
              <Text type="secondary">
                Các đối tác du lịch được kiểm duyệt kỹ lưỡng.
              </Text>
            </Col>
            <Col xs={24} md={8}>
              <DollarOutlined style={{ fontSize: 40, color: "#faad14" }} />
              <Title level={4}>Tiết kiệm chi phí</Title>
              <Text type="secondary">Công cụ so sánh giá minh bạch nhất.</Text>
            </Col>
            <Col xs={24} md={8}>
              <SmileOutlined style={{ fontSize: 40, color: "#1890ff" }} />
              <Title level={4}>Trải nghiệm tuyệt vời</Title>
              <Text type="secondary">
                Hỗ trợ khách hàng 24/7 mọi lúc mọi nơi.
              </Text>
            </Col>
          </Row>
        </div>
      </div>

      {/* 3. ĐỊA ĐIỂM HOT (DỮ LIỆU THẬT) */}
      <div style={{ padding: "60px 20px", background: BG_BLUE }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              marginBottom: 30,
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0 }}>
                🔥 Điểm đến thịnh hành
              </Title>
              <Text type="secondary">
                Các địa điểm được yêu thích nhất mùa này
              </Text>
            </div>
            <Button type="link" onClick={() => navigate("/places")}>
              Xem tất cả <ArrowRightOutlined />
            </Button>
          </div>

          <Row gutter={[24, 24]}>
            {places.map((place) => (
              <Col xs={24} sm={12} lg={6} key={place._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    height: "100%",
                  }}
                  bodyStyle={{ padding: 15 }}
                  cover={
                    <div
                      style={{
                        height: 200,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        alt={place.name}
                        src={place.image}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1.0)")
                        }
                      />
                      {place.rating >= 4.5 && (
                        <Tag
                          color="red"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 0,
                            margin: 0,
                            borderRadius: "4px 0 0 4px",
                          }}
                        >
                          HOT
                        </Tag>
                      )}
                    </div>
                  }
                  onClick={() => navigate(`/places/${place._id}`)}
                >
                  <Card.Meta
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={place.name}
                        >
                          {place.name}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: "normal" }}>
                          ⭐ {place.rating?.toFixed(1)}
                        </span>
                      </div>
                    }
                    description={
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginBottom: 5,
                          }}
                        >
                          <EnvironmentOutlined /> {place.country}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 10,
                          }}
                        >
                          <Text
                            delete
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            {(place.price * 1.2).toLocaleString()}₫
                          </Text>
                          <Text
                            strong
                            style={{ fontSize: 18, color: "#ff4d4f" }}
                          >
                            {place.price?.toLocaleString()}₫
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {places.length === 0 && (
            <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
              Chưa có địa điểm nào.
            </div>
          )}
        </div>
      </div>

      {/* 4. ƯU ĐÃI (Tĩnh) */}
      <div style={{ padding: "60px 20px", background: BG_WHITE }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(90deg, #0050b3 0%, #1890ff 100%)",
              borderRadius: 20,
              padding: "50px",
              textAlign: "center",
              color: "white",
              boxShadow: "0 10px 20px rgba(24, 144, 255, 0.3)",
            }}
          >
            <Title style={{ color: "white", marginBottom: 10 }}>
              🎉 ƯU ĐÃI THÀNH VIÊN MỚI
            </Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 18 }}>
              Nhập mã <strong>HELLO2026</strong> để được giảm ngay 15% cho
              chuyến đi đầu tiên.
            </Paragraph>
            <Button
              size="large"
              style={{
                color: "#0050b3",
                fontWeight: "bold",
                padding: "0 40px",
                height: 50,
                borderRadius: 25,
              }}
              onClick={() => navigate("/register")}
            >
              ĐĂNG KÝ NHẬN ƯU ĐÃI
            </Button>
          </div>
        </div>
      </div>

      {/* 5. CẨM NANG (Tĩnh - Giữ để trang đầy đặn) */}
      <div style={{ padding: "60px 20px", background: BG_BLUE }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Title level={2}>💡 Cẩm nang du lịch</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card
                hoverable
                bordered={false}
                bodyStyle={{ padding: 0 }}
                style={{ overflow: "hidden", height: "100%" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=2070"
                  style={{ width: "100%", height: 300, objectFit: "cover" }}
                />
                <div style={{ padding: 20 }}>
                  <Title level={4}>
                    10 vật dụng không thể thiếu khi đi máy bay
                  </Title>
                  <Paragraph ellipsis={{ rows: 2 }}>
                    Chuẩn bị hành lý là bước quan trọng nhất để có một chuyến đi
                    suôn sẻ...
                  </Paragraph>
                  <Button type="link" style={{ padding: 0 }}>
                    Đọc thêm
                  </Button>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[0, 24]}>
                {[1, 2, 3].map((i) => (
                  <Col span={24} key={i}>
                    <Card hoverable bordered={false} style={{ width: "100%" }}>
                      <Row gutter={16} align="middle">
                        <Col span={8}>
                          <img
                            src={`https://th.bing.com/th/id/OIP.OpecbSnFOl1uzSFbRfyJfgHaE8?w=233&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3,${i}`}
                            style={{
                              width: "100%",
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                          />
                        </Col>
                        <Col span={16}>
                          <Title level={5} style={{ margin: 0 }}>
                            Kinh nghiệm săn vé giá rẻ 2026
                          </Title>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            12/05/2026 • 5 phút đọc
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      {/* 6. REVIEWS (Tĩnh) */}
      <div style={{ padding: "80px 20px", background: BG_WHITE }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <Title level={2} style={{ marginBottom: 50 }}>
            Khách hàng nói gì về chúng tôi?
          </Title>
          <Row gutter={[30, 30]}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} md={8} key={i}>
                <Card
                  bordered={false}
                  style={{ background: "#f9f9f9", borderRadius: 12 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: -40,
                    }}
                  >
                    <Avatar
                      size={80}
                      src={`https://randomuser.me/api/portraits/women/${
                        i + 20
                      }.jpg`}
                      style={{ border: "4px solid white" }}
                    />
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <Rate disabled defaultValue={5} style={{ fontSize: 14 }} />
                    <Paragraph
                      style={{
                        marginTop: 15,
                        fontStyle: "italic",
                        color: "#666",
                      }}
                    >
                      "Ứng dụng tuyệt vời! Giúp tôi lên lịch trình chi tiết từng
                      phút. Rất đáng để trải nghiệm."
                    </Paragraph>
                    <Text strong>
                      — Nguyễn Thị {i === 1 ? "Mai" : i === 2 ? "Lan" : "Hương"}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* 7. CTA KẾT THÚC */}
      <div
        style={{
          padding: "80px 20px",
          background: BG_BLUE,
          textAlign: "center",
        }}
      >
        <Title level={2}>Sẵn sàng cho hành trình tiếp theo?</Title>
        <Paragraph style={{ fontSize: 18, marginBottom: 30 }}>
          Tham gia cùng hơn 10.000+ người dùng đang sử dụng TripPlanner mỗi
          ngày.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          shape="round"
          style={{ height: 60, padding: "0 60px", fontSize: 20 }}
          onClick={() => navigate("/login")}
        >
          Tạo chuyến đi miễn phí <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
};

export default Home;
