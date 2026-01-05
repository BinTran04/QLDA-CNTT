import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Select,
  Button,
  Spin,
  Empty,
  Tag,
  Rate,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "./../../services/api";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'price-asc', 'price-desc'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const { data } = await api.get("/places");
        setPlaces(data);
        setFilteredPlaces(data);
      } catch (error) {
        // Không hiện lỗi đỏ lòm nữa, chỉ log ra console
        console.error("Lỗi tải data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Xử lý tìm kiếm và sắp xếp
  useEffect(() => {
    let result = [...places];

    // 1. Lọc theo tên
    if (searchText) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.country.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 2. Sắp xếp
    if (sortOrder === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }
    // Mặc định là newest (dựa vào _id hoặc createdAt nếu có)

    setFilteredPlaces(result);
  }, [places, searchText, sortOrder]);

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      {/* 1. HEADER BANNER */}
      <div
        style={{
          background: "linear-gradient(to right, #0050b3, #1890ff)",
          padding: "60px 20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <Title style={{ color: "white", fontSize: 40, margin: 0 }}>
          🌏 Khám phá Thế giới
        </Title>
        <Paragraph
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 18,
            marginTop: 10,
          }}
        >
          Hàng trăm điểm đến hấp dẫn đang chờ đón bạn
        </Paragraph>
      </div>

      {/* 2. FILTER BAR */}
      <div
        style={{ maxWidth: 1200, margin: "-30px auto 30px", padding: "0 20px" }}
      >
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Input
                size="large"
                placeholder="Tìm điểm đến, thành phố..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                size="large"
                defaultValue="newest"
                style={{ width: "100%" }}
                onChange={(val) => setSortOrder(val)}
                prefix={<FilterOutlined />}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="price-asc">Giá: Thấp đến Cao</Option>
                <Option value="price-desc">Giá: Cao đến Thấp</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Button
                type="primary"
                size="large"
                block
                icon={<SearchOutlined />}
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 3. LIST PLACES */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <Empty description="Chưa có địa điểm nào phù hợp" />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredPlaces.map((place) => (
              <Col xs={24} sm={12} lg={8} key={place._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  bodyStyle={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  cover={
                    <div style={{ overflow: "hidden", height: 200 }}>
                      <img
                        alt={place.name}
                        src={
                          place.image ||
                          "https://placehold.co/600x400?text=No+Image"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1.0)")
                        }
                      />
                    </div>
                  }
                >
                  <div style={{ marginBottom: 10 }}>
                    <Tag color="blue">
                      <EnvironmentOutlined /> {place.country}
                    </Tag>
                  </div>
                  <Title
                    level={4}
                    style={{ margin: "0 0 10px", minHeight: 56 }}
                  >
                    {place.name}
                  </Title>
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ color: "#666", flex: 1 }}
                  >
                    {place.description}
                  </Paragraph>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 20,
                      paddingTop: 15,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Giá tham khảo
                      </Text>
                      <div
                        style={{
                          color: "#ff4d4f",
                          fontSize: 18,
                          fontWeight: "bold",
                        }}
                      >
                        {place.price ? place.price.toLocaleString() : 0}₫
                      </div>
                    </div>
                    <Button
                      type="primary"
                      shape="round"
                      onClick={() => navigate(`/places/${place._id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default Places;
