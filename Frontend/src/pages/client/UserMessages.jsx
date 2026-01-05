import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  List,
  Avatar,
  Input,
  Button,
  Typography,
  notification,
  Badge, // Đảm bảo đã import Badge
} from "antd";
import { SendOutlined, MessageOutlined } from "@ant-design/icons";
import api from "./../../services/api";
import io from "socket.io-client";

// Import file CSS chứa hiệu ứng nhấp nháy
import "./../../styles/UserMessages.css";

const { Sider, Content } = Layout;
const { Text, Title } = Typography;
const socket = io.connect("http://localhost:5000");

const UserMessages = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const messageListRef = useRef(null); // Ref để cuộn chat

  // Logic tự động cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    if (messageListRef.current) {
      const scrollHeight = messageListRef.current.scrollHeight;
      const height = messageListRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      if (maxScrollTop > 0) {
        messageListRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  const fetchUserRooms = async () => {
    try {
      const { data } = await api.get("/messages/user/history");
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserRooms();
  }, []);

  const selectRoom = async (room) => {
    // 1. OPTIMISTIC UPDATE: Xóa số đỏ ngay lập tức trên giao diện
    setRooms((prev) =>
      prev.map((r) => (r._id === room._id ? { ...r, unreadCount: 0 } : r))
    );

    setSelectedRoom({ ...room, unreadCount: 0 }); // Cập nhật state phòng đang chọn
    setMessages([]);
    try {
      // 2. Gọi API đánh dấu đã đọc
      if (room.unreadCount > 0) {
        await api.put("/messages/user/read", { placeId: room._id });
      }

      // 3. Tải tin nhắn
      const { data } = await api.get(
        `/messages/${room._id}?user=${encodeURIComponent(user.name)}`
      );
      setMessages(data);
      socket.emit("join_place", room._id);
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  useEffect(() => {
    const handleReceive = (data) => {
      // Nếu tin nhắn thuộc phòng đang mở
      if (selectedRoom && data.placeId === selectedRoom._id) {
        const isRelated =
          data.author === user.name || data.author !== selectedRoom.placeName;
        if (isRelated) {
          setMessages((prev) => {
            if (
              prev.some(
                (m) => m.message === data.message && m.time === data.time
              )
            )
              return prev;
            return [...prev, data];
          });

          // Nếu đang xem phòng này mà có tin mới từ Admin -> Đánh dấu đã đọc ngay
          if (data.author !== user.name) {
            api.put("/messages/user/read", { placeId: selectedRoom._id });
          }
        }
      }

      // LUÔN LUÔN CẬP NHẬT LẠI DANH SÁCH ĐỂ SỐ ĐỎ TĂNG LÊN
      fetchUserRooms();

      // Hiện thông báo popup nếu đang không xem phòng đó
      if (data.author !== user.name) {
        if (
          !selectedRoom ||
          selectedRoom._id !== data.placeId ||
          document.hidden
        ) {
          const audio = new Audio(
            "https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3"
          );
          audio.play().catch(() => {});
          notification.success({
            message: `Tin nhắn từ ${data.author}`,
            description: data.message,
            placement: "topRight",
            duration: 4,
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
      placeName: selectedRoom.placeName || "Địa điểm",
      author: user.name,
      message: inputValue,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, msgData]);
    await socket.emit("send_message", msgData);
    setInputValue("");
  };

  return (
    <div
      style={{ background: "#f0f2f5", padding: "20px 0", minHeight: "90vh" }}
    >
      <Layout
        style={{
          maxWidth: "1600px",
          width: "95%",
          margin: "0 auto",
          height: "85vh",
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <Sider
          width={350}
          theme="light"
          style={{ borderRight: "1px solid #f0f0f0" }}
        >
          <div
            style={{
              padding: "20px 16px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fafafa",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              💬 Tin nhắn của tôi
            </Title>
          </div>
          <List
            dataSource={rooms}
            renderItem={(item) => {
              const isSelected = selectedRoom && selectedRoom._id === item._id;

              // --- LOGIC GIAO DIỆN QUAN TRỌNG ---
              // 1. Class nhấp nháy: Chỉ nhấp nháy nếu có tin chưa đọc và KHÔNG đang chọn
              const flashingClass =
                item.unreadCount > 0 && !isSelected ? "unread-room-user" : "";

              return (
                <List.Item
                  onClick={() => selectRoom(item)}
                  className={flashingClass} // Áp dụng class CSS
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                    transition: "0.3s",
                    // Nếu đang chọn thì màu xanh, nếu không thì để 'inherit' để hiệu ứng nháy đỏ hoạt động
                    background: isSelected ? "#e6f7ff" : "inherit",
                    borderLeft: isSelected
                      ? "4px solid #1890ff"
                      : "4px solid transparent",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      // 2. BADGE ĐẾM SỐ TIN NHẮN CHƯA ĐỌC
                      <Badge
                        count={item.unreadCount}
                        overflowCount={5} // Hiện 5+ nếu quá nhiều
                        style={{ backgroundColor: "#f5222d" }}
                      >
                        <Avatar
                          size="large"
                          icon={<MessageOutlined />}
                          style={{ backgroundColor: "#1890ff" }}
                        />
                      </Badge>
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* 3. Tên địa điểm in đậm nếu có tin mới */}
                        <Text
                          strong={item.unreadCount > 0}
                          style={{
                            color: item.unreadCount > 0 ? "#000" : "inherit",
                          }}
                        >
                          {item.placeName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          {item.lastTime}
                        </Text>
                      </div>
                    }
                    description={
                      // 4. Tin nhắn in đậm và đỏ nếu chưa đọc
                      <Text
                        ellipsis
                        style={{
                          color: item.unreadCount > 0 ? "#f5222d" : "#595959",
                          fontWeight: item.unreadCount > 0 ? "bold" : "normal",
                        }}
                      >
                        {item.lastMessage}
                      </Text>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Sider>

        <Content
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          {selectedRoom ? (
            <>
              <div
                style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  Đang hỗ trợ: {selectedRoom.placeName}
                </Text>
              </div>

              <div
                ref={messageListRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px",
                  background: "#f9f9f9",
                  scrollBehavior: "smooth",
                }}
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: m.author === user.name ? "right" : "left",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#8c8c8c",
                        marginBottom: 4,
                      }}
                    >
                      {m.author} • {m.time}
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "10px 16px",
                        borderRadius:
                          m.author === user.name
                            ? "18px 18px 0 18px"
                            : "18px 18px 18px 0",
                        background: m.author === user.name ? "#1890ff" : "#fff",
                        color: m.author === user.name ? "#fff" : "#262626",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        maxWidth: "70%",
                        textAlign: "left",
                      }}
                    >
                      {m.message}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: "20px 24px",
                  background: "#fff",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={handleSend}
                    placeholder="Nhập tin nhắn của bạn..."
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    size="large"
                    style={{ borderRadius: 8, padding: "0 24px" }}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                background: "#f9f9f9",
              }}
            >
              <Avatar
                size={64}
                icon={<MessageOutlined />}
                style={{
                  backgroundColor: "#f5f5f5",
                  color: "#d9d9d9",
                  marginBottom: 16,
                }}
              />
              <Text type="secondary" style={{ fontSize: 16 }}>
                Chọn một địa điểm để xem lại tư vấn
              </Text>
            </div>
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default UserMessages;
