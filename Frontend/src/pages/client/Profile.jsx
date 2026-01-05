import { useEffect, useState, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Avatar,
  message,
  Typography,
  Divider,
  Dropdown,
  Modal,
  Upload,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  SaveOutlined,
  PhoneOutlined,
  HomeOutlined,
  EditOutlined,
  CameraOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import api from "./../../services/api";

const { Title, Text, Paragraph } = Typography;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // State cho tính năng ảnh
  const [previewOpen, setPreviewOpen] = useState(false); // Bật/tắt chế độ xem ảnh
  const [avatarPreview, setAvatarPreview] = useState(""); // Lưu ảnh tạm thời để hiển thị

  // Ref để kích hoạt input chọn file ngầm
  const fileInputRef = useRef(null);
  const [form] = Form.useForm(); // Hook để thao tác với form

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUser) {
      setUser(storedUser);
      setAvatarPreview(storedUser.avatar); // Khởi tạo ảnh preview bằng ảnh hiện tại
    }
  }, []);

  // 1. Xử lý khi người dùng chọn file từ máy
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra dung lượng (giới hạn 2MB cho nhẹ)
      if (file.size > 2 * 1024 * 1024) {
        message.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB");
        return;
      }

      // Biến đổi File -> Base64 (Chuỗi mã hóa)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setAvatarPreview(reader.result); // 1. Hiện ảnh mới lên màn hình ngay
        form.setFieldsValue({ avatar: reader.result }); // 2. Điền ngầm mã ảnh vào Form để chuẩn bị Lưu
        message.success('Đã chọn ảnh mới. Hãy bấm "Lưu thay đổi" để hoàn tất.');
      };
    }
  };

  // 2. Menu khi bấm vào Avatar
  const avatarMenu = [
    {
      key: "1",
      label: "Xem ảnh đại diện",
      icon: <EyeOutlined />,
      onClick: () => setPreviewOpen(true),
    },
    {
      key: "2",
      label: "Tải ảnh từ máy lên",
      icon: <UploadOutlined />,
      onClick: () => fileInputRef.current.click(), // Kích hoạt cái input ngầm
    },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.put("/users/profile", values);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      message.success("Cập nhật hồ sơ thành công! 🎉");
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingTop: 30 }}>
      <Title level={2} style={{ marginBottom: 30, textAlign: "center" }}>
        👤 Hồ sơ cá nhân
      </Title>

      {/* INPUT CHỌN FILE (Ẩn đi, chỉ kích hoạt khi bấm nút) */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />

      <Row gutter={24}>
        {/* Cột trái: Avatar & Preview */}
        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{
              textAlign: "center",
              borderRadius: 12,
              overflow: "hidden",
            }}
            cover={
              <div
                style={{
                  height: 120,
                  background:
                    "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
                }}
              ></div>
            }
          >
            <div
              style={{
                marginTop: -60,
                marginBottom: 20,
                position: "relative",
                display: "inline-block",
              }}
            >
              {/* Dropdown Menu bọc lấy Avatar */}
              <Dropdown menu={{ items: avatarMenu }} trigger={["click"]}>
                <div
                  style={{ cursor: "pointer", position: "relative" }}
                  className="avatar-container"
                >
                  {avatarPreview ? (
                    <Avatar
                      size={120}
                      src={avatarPreview}
                      style={{ border: "4px solid white" }}
                    />
                  ) : (
                    <Avatar
                      size={120}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: "#f56a00",
                        border: "4px solid white",
                      }}
                    />
                  )}

                  {/* Icon máy ảnh nhỏ xinh hiện đè lên */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 5,
                      right: 5,
                      background: "white",
                      borderRadius: "50%",
                      padding: 5,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      color: "#666",
                    }}
                  >
                    <CameraOutlined style={{ fontSize: 18 }} />
                  </div>
                </div>
              </Dropdown>
            </div>

            <Title level={3} style={{ margin: 0 }}>
              {user.name}
            </Title>
            <Text type="secondary">{user.email}</Text>

            <Divider />

            <div style={{ textAlign: "left" }}>
              <p>
                <PhoneOutlined /> <strong>SĐT:</strong>{" "}
                {user.phone || "Chưa cập nhật"}
              </p>
              <p>
                <HomeOutlined /> <strong>Đ/c:</strong>{" "}
                {user.address || "Chưa cập nhật"}
              </p>
              <Paragraph ellipsis={{ rows: 2 }}>
                <EditOutlined /> <strong>Bio:</strong> "{user.bio || "..."}"
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Cột phải: Form nhập liệu */}
        <Col xs={24} md={16}>
          <Card title="✏️ Chỉnh sửa thông tin" style={{ borderRadius: 12 }}>
            <Form
              form={form} // Gắn form instance để set giá trị ngầm
              layout="vertical"
              initialValues={user}
              onFinish={onFinish}
            >
              {/* Trường Avatar (Ẩn, dùng để gửi dữ liệu lên server) */}
              <Form.Item name="avatar" hidden>
                <Input />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="name"
                    rules={[{ required: true }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Tên hiển thị"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input prefix={<PhoneOutlined />} placeholder="09xxxx..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Địa chỉ" name="address">
                <Input
                  prefix={<HomeOutlined />}
                  placeholder="Ví dụ: Hà Nội, Việt Nam"
                />
              </Form.Item>

              <Form.Item label="Giới thiệu bản thân (Bio)" name="bio">
                <Input.TextArea
                  rows={3}
                  placeholder="Sở thích du lịch, câu nói yêu thích..."
                />
              </Form.Item>

              <Form.Item label="Email (Không thể thay đổi)" name="email">
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={loading}
                  block
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Modal Xem Ảnh Full Size */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img
          alt="avatar-full"
          style={{ width: "100%" }}
          src={avatarPreview || "https://placehold.co/400"}
        />
      </Modal>
    </div>
  );
};

export default Profile;
