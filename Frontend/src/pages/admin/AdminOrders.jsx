import { useEffect, useState } from "react";
import { Table, Tag, Space, Button, message, Card, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import api from "../../services/api";
import dayjs from "dayjs";

const { Title } = Typography;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm tải danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings");
      setOrders(data);
    } catch (error) {
      message.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Xử lý duyệt/hủy
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      const actionText = status === "Confirmed" ? "Duyệt đơn" : "Hủy đơn";
      message.success(`Đã ${actionText} thành công!`);
      fetchOrders(); // Tải lại dữ liệu sau khi cập nhật
    } catch (error) {
      message.error(
        "Lỗi cập nhật: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id) => <Tag>#{id.slice(-6).toUpperCase()}</Tag>,
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
      render: (user) => user?.name || "Khách vãng lai",
    },
    {
      title: "Địa điểm",
      dataIndex: "place",
      render: (place) => place?.name || "Vé tham quan",
    },
    {
      title: "Ngày đi",
      dataIndex: "bookingDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      render: (price) => (
        <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
          {price?.toLocaleString()}đ
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        let color = "orange";
        let text = "CHỜ XỬ LÝ";
        if (status === "Confirmed") {
          color = "green";
          text = "ĐÃ DUYỆT";
        } else if (status === "Cancelled") {
          color = "red";
          text = "ĐÃ HỦY";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            disabled={record.status !== "Pending"} // Khóa nút nếu đã xử lý
            onClick={() => handleUpdateStatus(record._id, "Confirmed")}
          >
            Duyệt
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            disabled={record.status !== "Pending"} // Khóa nút nếu đã xử lý
            onClick={() => handleUpdateStatus(record._id, "Cancelled")}
          >
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>
        📦 Quản lý Đơn hàng
      </Title>
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }} // Hiển thị 10 dòng mỗi trang
        />
      </Card>
    </div>
  );
};

export default AdminOrders;
