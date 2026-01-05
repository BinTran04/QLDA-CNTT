const mongoose = require("mongoose");
const dotenv = require("dotenv");
// Import các Models đã tạo
const User = require("../models/User");
const Place = require("../models/Place");
const Event = require("../models/Event");
const Itinerary = require("../models/Itinerary");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Expense = require("../models/Expense");
const connectDB = require("../config/db");

dotenv.config();
connectDB();

// --- DỮ LIỆU MẪU ---

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "123456", // Sẽ được mã hóa tự động nhờ model User
    isAdmin: true,
  },
  {
    name: "Normal User",
    email: "user@example.com",
    password: "123456",
    isAdmin: false,
  },
];

const places = [
  {
    name: "Hồ Gươm",
    description: "Trái tim của thủ đô Hà Nội.",
    image: "https://example.com/hoguom.jpg",
    location: {
      type: "Point",
      coordinates: [105.852, 21.028],
      address: "Hoan Kiem, Hanoi",
    },
    category: "Culture",
    priceLevel: "$",
  },
  {
    name: "Phố Cổ Hội An",
    description: "Di sản văn hóa thế giới với kiến trúc cổ kính.",
    image: "https://example.com/hoian.jpg",
    location: {
      type: "Point",
      coordinates: [108.327, 15.88],
      address: "Quang Nam",
    },
    category: "Culture",
    priceLevel: "$$",
  },
  {
    name: "Bà Nà Hills",
    description: "Khu du lịch trên núi với Cầu Vàng nổi tiếng.",
    image: "https://example.com/banahills.jpg",
    location: {
      type: "Point",
      coordinates: [107.994, 15.996],
      address: "Da Nang",
    },
    category: "Nature",
    priceLevel: "$$$",
  },
];

const events = [
  {
    name: "Lễ hội Pháo hoa Quốc tế",
    description: "Cuộc thi pháo hoa giữa các quốc gia.",
    startDate: new Date("2026-06-01"),
    ticketPrice: 500000,
    availableTickets: 1000,
    status: "Upcoming",
  },
];

// --- HÀM XỬ LÝ ---

const importData = async () => {
  try {
    // 1. Xóa sạch dữ liệu cũ
    await Booking.deleteMany();
    await Review.deleteMany();
    await Expense.deleteMany();
    await Itinerary.deleteMany();
    await Event.deleteMany();
    await Place.deleteMany();
    await User.deleteMany();

    // 2. Tạo User trước
    // Lưu ý: Dùng create() thay vì insertMany() để kích hoạt middleware mã hóa password trong User Model
    const createdUsers = [];
    for (const u of users) {
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }

    const adminUser = createdUsers[0]._id; // Lấy ID admin để gán quyền sở hữu nếu cần

    // 3. Tạo Place
    await Place.insertMany(places);

    // 4. Tạo Event (Gắn tạm vào địa điểm đầu tiên)
    const placeDb = await Place.findOne();
    const sampleEvents = events.map((ev) => ({ ...ev, place: placeDb._id }));
    await Event.insertMany(sampleEvents);

    console.log("Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Booking.deleteMany();
    await Review.deleteMany();
    await Expense.deleteMany();
    await Itinerary.deleteMany();
    await Event.deleteMany();
    await Place.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Kiểm tra tham số dòng lệnh
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
