import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Popconfirm,
  Image,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import api from "./../../services/api"; // Chú ý đường dẫn import api (lùi 2 cấp)

const AdminPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [form] = Form.useForm();

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/places");
      setPlaces(data);
    } catch (error) {
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Xử lý logic Gallery: Chuyển chuỗi xuống dòng thành mảng
  const handleFinish = async (values) => {
    // Tách chuỗi gallery (từng dòng) thành mảng
    const galleryArray = values.galleryString
      ? values.galleryString.split("\n").filter((link) => link.trim() !== "")
      : [];

    const payload = { ...values, gallery: galleryArray }; // Gộp gallery vào dữ liệu gửi đi

    try {
      if (editingPlace) {
        await api.put(`/places/${editingPlace._id}`, payload);
        message.success("Cập nhật thành công!");
      } else {
        await api.post("/places", payload);
        message.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingPlace(null);
      fetchPlaces();
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/places/${id}`);
      message.success("Đã xóa");
      fetchPlaces();
    } catch (error) {
      message.error("Lỗi khi xóa");
    }
  };

  const openAddModal = () => {
    setEditingPlace(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingPlace(record);
    // Chuyển mảng gallery thành chuỗi (để hiển thị trong ô nhập liệu)
    const galleryString = record.gallery ? record.gallery.join("\n") : "";

    form.setFieldsValue({
      ...record,
      galleryString: galleryString, // Gán vào field ảo galleryString
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Ảnh bìa",
      dataIndex: "image",
      key: "image",
      render: (src) => <Image width={80} src={src} />,
    },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Giá", dataIndex: "price", render: (p) => p?.toLocaleString() },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2>📍 Quản lý Địa điểm</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Thêm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={places}
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingPlace ? "Sửa địa điểm" : "Thêm địa điểm mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Tên địa điểm"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Quốc gia"
            name="country"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Link Google Map (Embed)"
            name="mapEmbed"
            help="Vào Google Maps -> Chia sẻ -> Nhúng bản đồ -> Copy link trong thẻ src (chỉ lấy đoạn https://...)"
          >
            <Input placeholder="Dán link https://www.google.com/maps/embed... vào đây" />
          </Form.Item>
          <Form.Item
            label="Link Ảnh Bìa (1 ảnh)"
            name="image"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          {/* Ô NHẬP GALLERY MỚI */}
          <Form.Item
            label="Thư viện ảnh (Nhập nhiều link, mỗi link một dòng)"
            name="galleryString"
            help="Ví dụ: Link1 [Enter] Link2 [Enter] Link3"
          >
            <Input.TextArea
              rows={4}
              placeholder="Dán các link ảnh phụ vào đây..."
            />
          </Form.Item>

          <Form.Item label="Giá vé" name="price" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Lưu lại
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPlaces;
