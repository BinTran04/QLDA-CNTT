import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Card,
  Tag,
  Spin,
  message,
  DatePicker,
  InputNumber,
  Divider,
  Image,
  Rate,
  List,
  Avatar,
  Form,
  Input,
  Modal, // Đã import Modal
} from "antd";
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import PlaceChat from "../../components/PlaceChat";
import api from "./../../services/api";

const { Title, Paragraph, Text } = Typography;

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // --- STATE QUẢN LÝ ĐẶT VÉ ---
  const [guests, setGuests] = useState(1);
  const [bookingDate, setBookingDate] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  // --- STATE MỚI CHO THANH TOÁN ---
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const { data } = await api.get(`/places/${id}`);
        setPlace(data);
      } catch (error) {
        message.error("Không tìm thấy địa điểm");
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  // Giai đoạn 1: Bấm nút "ĐẶT NGAY" -> Chỉ hiện bảng thanh toán
  const handleBooking = () => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user) {
      message.warning("Vui lòng đăng nhập để đặt vé! 🔒");
      return navigate("/login");
    }
    if (!bookingDate) {
      return message.error("Vui lòng chọn ngày khởi hành! 📅");
    }

    // Tính tiền và Mở Modal thanh toán
    const amount = place.price * guests;
    setTotalAmount(amount);
    setIsPaymentOpen(true); // <--- Mở Modal
  };

  // Giai đoạn 2: Khách bấm "TÔI ĐÃ CHUYỂN KHOẢN" -> Gọi API lưu đơn
  const onConfirmPayment = async () => {
    setIsBooking(true);
    try {
      await api.post("/bookings", {
        type: "TableReservation",
        target_id: id,
        bookingDate: bookingDate,
        quantity: guests,
      });

      message.success("Thanh toán & Đặt vé thành công! 🎉");
      setIsPaymentOpen(false);
      navigate("/my-trips");
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi đặt vé");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  if (!place)
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        Địa điểm không tồn tại
      </div>
    );

  return (
    <div
      style={{ background: "#f0f2f5", minHeight: "100vh", paddingBottom: 60 }}
    >
      {/* 1. HERO HEADER */}
      <div
        style={{
          height: "60vh",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${place.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 5%",
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            color: "white",
            fontSize: 18,
            background: "rgba(0,0,0,0.3)",
          }}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <div
          style={{
            color: "white",
            marginBottom: 60,
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Tag
            color="blue"
            style={{ fontSize: 16, padding: "5px 15px", marginBottom: 15 }}
          >
            <EnvironmentOutlined /> {place.country}
          </Tag>
          <Title
            style={{
              color: "white",
              fontSize: 50,
              margin: 0,
              textShadow: "2px 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {place.name}
          </Title>
        </div>
      </div>

      {/* 2. NỘI DUNG CHI TIẾT */}
      <div
        style={{
          maxWidth: 1200,
          margin: "-40px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Row gutter={40}>
          {/* CỘT TRÁI: THÔNG TIN */}
          <Col xs={24} md={16}>
            <Card style={{ borderRadius: 12, marginBottom: 20 }}>
              <Title level={3}>Giới thiệu</Title>
              <Paragraph
                style={{ fontSize: 16, lineHeight: 1.8, color: "#555" }}
              >
                {place.description}
              </Paragraph>

              <Divider />

              <Title level={4}>Vị trí trên bản đồ</Title>
              <div
                style={{
                  width: "100%",
                  height: "350px",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {place.mapEmbed ? (
                  <iframe
                    src={place.mapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                    }}
                  >
                    Chưa có bản đồ
                  </div>
                )}
              </div>
              <Divider />

              <Title level={4}>Điểm nổi bật</Title>
              <Row gutter={[16, 16]}>
                {[
                  "Xe đưa đón tận nơi",
                  "Hướng dẫn viên nhiệt tình",
                  "Bảo hiểm du lịch",
                  "Vé tham quan trọn gói",
                ].map((item) => (
                  <Col span={12} key={item}>
                    <Text>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
                      {item}
                    </Text>
                  </Col>
                ))}
              </Row>

              <Divider />
              <Title level={4}>Thư viện ảnh</Title>
              {place.gallery && place.gallery.length > 0 ? (
                <Row gutter={[10, 10]}>
                  {place.gallery.map((imgUrl, index) => (
                    <Col xs={12} sm={8} key={index}>
                      <Image
                        src={imgUrl}
                        style={{
                          borderRadius: 8,
                          objectFit: "cover",
                          width: "100%",
                          height: "150px",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        fallback="https://placehold.co/600x400?text=Loi+Anh"
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Text type="secondary" style={{ fontStyle: "italic" }}>
                  Chưa có hình ảnh nào khác.
                </Text>
              )}
              <Divider />

              <Title level={4}>Đánh giá ({place.numReviews})</Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Title
                  level={2}
                  style={{ margin: 0, marginRight: 10, color: "#fadb14" }}
                >
                  {place.rating?.toFixed(1)}
                </Title>
                <Rate disabled allowHalf value={place.rating} />
              </div>

              <List
                itemLayout="horizontal"
                dataSource={place.reviews}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <>
                          <Text strong>{item.name}</Text>{" "}
                          <Rate
                            disabled
                            style={{ fontSize: 12, marginLeft: 10 }}
                            value={item.rating}
                          />
                        </>
                      }
                      description={
                        <div>
                          <div>{item.comment}</div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {item.createdAt?.substring(0, 10)}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />

              <div
                style={{
                  marginTop: 30,
                  background: "#fafafa",
                  padding: 20,
                  borderRadius: 8,
                }}
              >
                <Text strong>Viết đánh giá của bạn:</Text>
                <Form
                  onFinish={async (values) => {
                    try {
                      await api.post(`/places/${id}/reviews`, values);
                      message.success("Cảm ơn bạn đã đánh giá! ⭐");
                      window.location.reload();
                    } catch (error) {
                      message.error(
                        error.response?.data?.message || "Lỗi gửi đánh giá"
                      );
                    }
                  }}
                >
                  <Form.Item
                    name="rating"
                    label="Số sao"
                    rules={[{ required: true }]}
                  >
                    <Rate />
                  </Form.Item>
                  <Form.Item
                    name="comment"
                    label="Bình luận"
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Gửi đánh giá
                  </Button>
                </Form>
              </div>
            </Card>
          </Col>

          {/* CỘT PHẢI: FORM ĐẶT VÉ */}
          <Col xs={24} md={8}>
            <Card
              style={{
                borderRadius: 12,
                position: "sticky",
                top: 100,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <Text type="secondary">Giá khởi điểm</Text>
                <Title level={2} style={{ color: "#ff4d4f", margin: 0 }}>
                  {place.price?.toLocaleString()}₫
                </Title>
                <Text>/ khách</Text>
              </div>

              <div style={{ marginBottom: 20 }}>
                <Text strong>Chọn ngày đi</Text>
                <DatePicker
                  style={{ width: "100%", marginTop: 5 }}
                  size="large"
                  format="DD/MM/YYYY"
                  onChange={(date) => setBookingDate(date)}
                  disabledDate={(current) => current && current < Date.now()}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <Text strong>Số lượng khách</Text>
                <InputNumber
                  min={1}
                  max={50}
                  defaultValue={1}
                  style={{ width: "100%", marginTop: 5 }}
                  size="large"
                  onChange={setGuests}
                />
              </div>

              <Divider />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  fontSize: 16,
                }}
              >
                <Text>Tạm tính:</Text>
                <Text strong>{(place.price * guests).toLocaleString()}₫</Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                // Nút này bây giờ chỉ mở Modal, không loading
                onClick={handleBooking}
                style={{ height: 50, fontSize: 18, fontWeight: "bold" }}
              >
                ĐẶT NGAY
              </Button>
              <div style={{ textAlign: "center", marginTop: 15 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Không thanh toán ngay. Xác nhận sau.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* --- ĐÂY LÀ PHẦN BẠN CÒN THIẾU: MODAL THANH TOÁN QR --- */}
      <Modal
        title={
          <div
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "#1890ff",
            }}
          >
            💳 CỔNG THANH TOÁN
          </div>
        }
        open={isPaymentOpen}
        onCancel={() => setIsPaymentOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsPaymentOpen(false)}>
            Để sau
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={isBooking}
            onClick={onConfirmPayment}
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
          >
            ✅ TÔI ĐÃ CHUYỂN KHOẢN
          </Button>,
        ]}
        centered
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <Text type="secondary">
            Vui lòng quét mã QR bên dưới để thanh toán
          </Text>

          <div
            style={{
              margin: "20px auto",
              width: 300,
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {/* TẠO MÃ QR TỰ ĐỘNG THEO SỐ TIỀN */}
            <img
              src={`https://img.vietqr.io/image/MB-0335626696-compact.png?amount=${totalAmount}&addInfo=TRIP ${
                id ? id.slice(-6).toUpperCase() : "BOOKING"
              }`}
              alt="QR Code"
              style={{ width: "100%" }}
            />
          </div>

          <Title level={3} style={{ color: "#ff4d4f", margin: "10px 0" }}>
            {totalAmount.toLocaleString()} VNĐ
          </Title>

          <div
            style={{
              background: "#f5f5f5",
              padding: 10,
              borderRadius: 8,
              textAlign: "left",
              fontSize: 13,
            }}
          >
            <p>
              🏦 <strong>Ngân hàng:</strong> MB Bank (Quân Đội)
            </p>
            <p>
              👤 <strong>Chủ tài khoản:</strong> TRIP PLANNER COMPANY
            </p>
            <p>
              🔢 <strong>Số tài khoản:</strong> 0335626696
            </p>
            <p>
              📝 <strong>Nội dung CK:</strong> TRIP{" "}
              {id ? id.slice(-6).toUpperCase() : "CODE"}
            </p>
          </div>

          <div
            style={{
              marginTop: 15,
              color: "red",
              fontStyle: "italic",
              fontSize: 12,
            }}
          >
            * Lưu ý: Đây là mô phỏng. Vui lòng bấm nút "Tôi đã chuyển khoản" để
            hoàn tất đơn hàng.
          </div>
        </div>
      </Modal>
      {/* --- NÚT CHAT NỔI (FLOAT BUTTON) --- */}
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined style={{ fontSize: 24 }} />}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
        onClick={() => setIsChatOpen(true)}
      />

      {/* --- MODAL CHUNG CHO KHUNG CHAT --- */}
      <Modal
        title={`Hỏi đáp trực tuyến: ${place?.name}`}
        open={isChatOpen}
        onCancel={() => setIsChatOpen(false)}
        footer={null}
        width={400}
        styles={{ body: { padding: 0 } }} // Bỏ padding để khung chat khít Modal
        style={{ position: "fixed", bottom: 100, right: 30, margin: 0 }}
        mask={false} // Cho phép vừa chat vừa xem web
      >
        <PlaceChat placeId={id} placeName={place?.name} user={user} />
      </Modal>
    </div>
  );
};

export default PlaceDetail;
