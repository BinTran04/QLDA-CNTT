const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect, admin } = require("../middleware/authMiddleware");

// 1. Lấy danh sách các cuộc hội thoại (Tách riêng theo Người dùng + Địa điểm)
// Backend/routes/messageRoutes.js

// 1. Lấy danh sách các cuộc hội thoại (Chỉ lấy khách hàng, loại bỏ Admin)
router.get("/rooms", protect, admin, async (req, res) => {
  try {
    const rooms = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { placeId: "$placeId", author: "$author" },
          placeName: { $first: "$placeName" },
          lastMessage: { $first: "$message" },
          lastTime: { $first: "$time" },
          createdAt: { $first: "$createdAt" },

          // Đếm số tin chưa đọc
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isRead", false] },
                    { $ne: ["$author", req.user.name] },
                    { $ne: ["$author", "Admin"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      // --- THÊM ĐOẠN NÀY ĐỂ LỌC BỎ ADMIN ---
      {
        $match: {
          // Loại bỏ các nhóm mà tác giả là Admin hiện tại hoặc tên là "Admin"
          "_id.author": { $nin: [req.user.name, "Admin"] },
        },
      },
      // ------------------------------------
      { $sort: { createdAt: -1 } },
    ]);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách phòng" });
  }
});

// 2. THÊM ROUTE NÀY: Đánh dấu đã đọc
router.put("/read", protect, admin, async (req, res) => {
  const { placeId, author } = req.body;
  try {
    await Message.updateMany(
      { placeId, author, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// 2. API lấy lịch sử chat của User (CẬP NHẬT ĐỂ ĐẾM SỐ TIN CHƯA ĐỌC)
router.get("/user/history", protect, async (req, res) => {
  try {
    // BƯỚC 1: Tìm danh sách các PlaceId mà User này đã từng nhắn tin
    const myPlaceIds = await Message.find({ author: req.user.name }).distinct(
      "placeId"
    );

    // BƯỚC 2: Tìm tất cả tin nhắn thuộc các PlaceId đó (Bao gồm cả tin của Admin trả lời)
    const rooms = await Message.aggregate([
      { $match: { placeId: { $in: myPlaceIds } } }, // Lấy tất cả tin trong hội thoại đó
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$placeId",
          placeName: { $first: "$placeName" },
          lastMessage: { $first: "$message" },
          lastTime: { $first: "$time" },
          createdAt: { $first: "$createdAt" },

          // Đếm số tin nhắn chưa đọc (unreadCount)
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isRead", false] }, // Tin chưa đọc
                    { $ne: ["$author", req.user.name] }, // VÀ KHÔNG PHẢI tin của mình (tức là tin của Admin)
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy lịch sử chat của người dùng" });
  }
});

// 2. THÊM API MỚI: User đánh dấu đã đọc (Khác với API của Admin)
router.put("/user/read", protect, async (req, res) => {
  const { placeId } = req.body;
  try {
    // Cập nhật tất cả tin nhắn trong Place này mà KHÔNG PHẢI do mình gửi -> thành đã đọc
    await Message.updateMany(
      {
        placeId: placeId,
        author: { $ne: req.user.name }, // Tin của người khác (Admin)
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    res.json({ message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
});
// 3. Lấy chi tiết tin nhắn (Cập nhật để lọc theo user cụ thể)
router.get("/:placeId", protect, async (req, res) => {
  try {
    const { user } = req.query; // Lấy tham số user từ URL (nếu có)

    let filter = { placeId: req.params.placeId };

    // Nếu Admin muốn xem lịch sử chat với một User cụ thể
    if (user) {
      filter.$or = [
        { author: user }, // Tin nhắn của khách đó
        { author: req.user.name }, // Tin nhắn Admin trả lời
        { author: "Admin" }, // Hoặc tin nhắn từ hệ thống
      ];
    }

    const messages = await Message.find(filter).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy nội dung tin nhắn" });
  }
});

module.exports = router;
