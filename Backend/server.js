const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const placeRoutes = require("./routes/placeRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const eventRoutes = require("./routes/eventRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const Message = require("./models/Message");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors()); // Di chuyển lên trên cùng để tránh lỗi chặn kết nối FE
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("Kết nối mới: " + socket.id);

  // Admin tham gia phòng thông báo toàn cục
  socket.on("admin_join", () => {
    socket.join("admin_room");
    console.log("Admin đã tham gia phòng thông báo");
  });

  // Tham gia phòng chat riêng của từng địa điểm
  socket.on("join_place", (placeId) => {
    socket.join(placeId);
    console.log(`Đã vào phòng: ${placeId}`);
  });

  // Xử lý gửi tin nhắn
  socket.on("send_message", async (data) => {
    try {
      // Đảm bảo dữ liệu tối thiểu để không lỗi Validation
      if (!data.placeName) data.placeName = "Địa điểm du lịch";

      const newMessage = await Message.create(data);

      // Gửi cho mọi người trong phòng (Gồm cả Admin và User đang mở tab này)
      io.to(data.placeId).emit("receive_message", data);

      // Thông báo cho Admin ở trang tổng để nhảy thông báo/cập nhật danh sách
      io.to("admin_room").emit("admin_notification", data);
    } catch (err) {
      console.error("Lỗi Socket khi lưu tin nhắn:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Ngắt kết nối");
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", require("./routes/messageRoutes"));

app.get("/", (req, res) => res.send("API is running..."));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
