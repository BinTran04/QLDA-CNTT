import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  List,
  Avatar,
  Input,
  Button,
  Typography,
  notification,
  Badge,
} from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import api from "../../services/api";
import io from "socket.io-client";
import "./../../styles/AdminMessages.css";

// Lấy component từ Sider, Content từ Layout
const { Sider, Content } = Layout;

// Lấy component từ Text, Title từ Typography
const { Text, Title } = Typography;

// Tạo kết nối socket tới server để trao đổi dữ liệu thời gian thực
const socket = io.connect("http://localhost:5000");

const AdminMessages = () => {
  // Lưu danh sách các phòng chat (rooms) trong ứng dụng.
  const [rooms, setRooms] = useState([]);

  // Lưu thông tin phòng chat mà người dùng đang tham gia.
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Lưu toàn bộ tin nhắn trong phòng chat hiện tại.
  const [messages, setMessages] = useState([]);

  // Lưu giá trị text mà người dùng đang gõ trong input.
  const [inputValue, setInputValue] = useState("");

  // Lấy thông tin người dùng đã đăng nhập (tên, email, token) từ bộ nhớ trình duyệt.
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // Tạo Ref để tham chiếu đến cuối danh sách chat
  const messagesEndRef = useRef(null);

  // 3. Hàm tự động cuộn xuống dưới cùng
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 4. Gọi hàm cuộn mỗi khi danh sách tin nhắn (messages) thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/messages/rooms");
      setRooms(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách phòng:", error);
    }
  };

  // 2. TÌM VÀ CẬP NHẬT useEffect LẮNG NGHE admin_notification
  useEffect(() => {
    fetchRooms();
    socket.emit("admin_join");

    // Khi có tin nhắn mới từ bất kỳ ai gửi đến hệ thống
    socket.on("admin_notification", (data) => {
      fetchRooms(); // Cập nhật lại danh sách bên trái

      // CHỈ HIỆN THÔNG BÁO NẾU NGƯỜI GỬI KHÔNG PHẢI LÀ ADMIN (CHÍNH MÌNH)
      if (data.author !== user.name) {
        // Phát âm thanh (Tùy chọn)
        const audio = new Audio(
          "https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3"
        );
        audio.play().catch(() => {}); // Bỏ qua lỗi nếu trình duyệt chặn tự phát

        // Hiện thông báo góc phải
        notification.info({
          message: `Tin nhắn mới từ ${data.author}`,
          description: `${data.message} (tại ${data.placeName})`,
          placement: "topRight",
          duration: 3, // Tự tắt sau 3 giây
          icon: <UserOutlined style={{ color: "#108ee9" }} />,
        });
      }
    });

    return () => socket.off("admin_notification");
  }, []);

  const selectRoom = async (room) => {
    const targetAuthor = room._id.author;
    const targetPlaceId = room._id.placeId;

    // 1. CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC (Optimistic Update)
    // Biến số tin chưa đọc thành 0 ngay trên giao diện để mất số đỏ và hết nháy
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r._id.placeId === targetPlaceId && r._id.author === targetAuthor) {
          return { ...r, unreadCount: 0 }; // Ép số về 0
        }
        return r;
      })
    );

    // 2. Chọn phòng
    setSelectedRoom({
      ...room,
      author: targetAuthor,
      _id: targetPlaceId,
      unreadCount: 0, // Cập nhật state phòng đang chọn luôn
    });

    setMessages([]);

    try {
      // 3. Gọi Server xử lý ngầm (Người dùng không cần chờ bước này)
      if (room.unreadCount > 0) {
        // Gọi API đánh dấu đã đọc
        await api.put("/messages/read", {
          placeId: targetPlaceId,
          author: targetAuthor,
        });
        // Không cần gọi fetchRooms() ở đây nữa vì ta đã cập nhật giao diện ở bước 1 rồi
      }

      // 4. Lấy nội dung tin nhắn
      const { data } = await api.get(
        `/messages/${targetPlaceId}?user=${encodeURIComponent(targetAuthor)}`
      );
      setMessages(data);
      socket.emit("join_place", targetPlaceId);
    } catch (error) {
      console.error("Lỗi:", error);
      // Nếu lỗi thì nên load lại danh sách để đồng bộ lại (fallback)
      fetchRooms();
    }
  };

  useEffect(() => {
    const handleReceive = (data) => {
      if (selectedRoom && data.placeId === selectedRoom._id) {
        const isRelavant =
          data.author === selectedRoom.author || data.author === user.name;
        if (isRelavant) {
          setMessages((prev) => {
            const isDuplicate = prev.some(
              (m) => m.message === data.message && m.time === data.time
            );
            if (isDuplicate) return prev;
            return [...prev, data];
          });
        }
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [selectedRoom]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedRoom) return;
    const msgData = {
      placeId: selectedRoom._id,
      placeName: selectedRoom.placeName,
      author: user.name,
      message: inputValue,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Cập nhật ngay vào giao diện để admin thấy liền (Optimistic Update)
    setMessages((prev) => [...prev, msgData]);

    await socket.emit("send_message", msgData);
    setInputValue("");
  };

  return (
    <Layout
      style={{
        height: "80vh",
        background: "#fff",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <Sider
        width={320}
        theme="light"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
          <Title level={4}>Tin nhắn khách hàng</Title>
        </div>
        <List
          dataSource={rooms}
          renderItem={(item) => {
            const isSelected =
              selectedRoom &&
              selectedRoom._id === item._id.placeId &&
              selectedRoom.author === item._id.author;
            const flashingClass =
              item.unreadCount > 0 && !isSelected ? "unread-room" : "";

            return (
              <List.Item
                onClick={() => selectRoom(item)}
                className={flashingClass} // Áp dụng class nhấp nháy
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  // Nếu đang chọn thì màu xanh, nếu không thì để hiệu ứng nhấp nháy tự quyết định màu
                  background: isSelected ? "#e6f7ff" : "inherit",
                  borderLeft: isSelected
                    ? "4px solid #1890ff"
                    : "4px solid transparent",
                }}
              >
                <List.Item.Meta
                  avatar={
                    // 2. SỬA ĐOẠN BADGE NÀY: Dùng overflowCount={5} để hiện 5+
                    <Badge
                      count={item.unreadCount} // Truyền đúng số tin chưa đọc
                      overflowCount={5} // Tự động biến thành "5+" nếu > 5
                      style={{ backgroundColor: "#f5222d" }} // Màu đỏ đậm
                    >
                      <Avatar
                        shape="square"
                        style={{ backgroundColor: "#87d068" }}
                        icon={<UserOutlined />}
                      >
                        {item._id.author?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </Badge>
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Tên khách hàng in đậm nếu chưa đọc */}
                      <Text
                        strong={item.unreadCount > 0}
                        style={{
                          color: item.unreadCount > 0 ? "#000" : "inherit",
                        }}
                      >
                        {item._id.author}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {item.lastTime}
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "11px",
                          display: "block",
                          color: "#1890ff",
                        }}
                      >
                        📍 {item.placeName}
                      </Text>
                      {/* Tin nhắn in đậm nếu chưa đọc */}
                      <Text
                        ellipsis
                        style={{
                          color: item.unreadCount > 0 ? "#f5222d" : "#595959",
                          fontWeight: item.unreadCount > 0 ? "bold" : "normal",
                        }}
                      >
                        {item.lastMessage}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Sider>
      <Content style={{ display: "flex", flexDirection: "column" }}>
        {selectedRoom ? (
          <>
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #f0f0f0",
                background: "#fff",
              }}
            >
              <Text style={{ fontSize: 16 }}>
                Đang hỗ trợ: <Text strong>{selectedRoom.author}</Text> tại{" "}
                <Text strong type="success">
                  {selectedRoom.placeName}
                </Text>
              </Text>
            </div>

            {/* Vùng hiển thị tin nhắn */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                background: "#f5f5f5",
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: m.author === user.name ? "right" : "left",
                    marginBottom: 15,
                  }}
                >
                  <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>
                    {m.author} • {m.time}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      background: m.author === user.name ? "#1890ff" : "#fff",
                      color: m.author === user.name ? "#fff" : "#000",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      maxWidth: "70%",
                      textAlign: "left",
                    }}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
              {/* 5. Thẻ div trống dùng để đánh dấu điểm cuối cùng */}
              <div ref={messagesEndRef} />
            </div>

            <div
              style={{
                padding: 16,
                display: "flex",
                gap: 10,
                background: "#fff",
              }}
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSend}
                placeholder={`Trả lời ${selectedRoom.author}...`}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
              >
                Gửi
              </Button>
            </div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#999",
              flexDirection: "column",
            }}
          >
            <UserOutlined
              style={{ fontSize: 48, marginBottom: 16, color: "#d9d9d9" }}
            />
            <Text type="secondary">Chọn một khách hàng để bắt đầu hỗ trợ</Text>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default AdminMessages;
