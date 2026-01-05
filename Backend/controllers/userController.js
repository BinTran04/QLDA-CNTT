const User = require("../models/User"); // Đảm bảo bạn đã có model User (thường là User.js hoặc userModel.js)
const bcrypt = require("bcryptjs");

// Hàm tạo token (copy từ authController sang nếu cần, hoặc để trống nếu không dùng)
const generateToken = require("../utils/generateToken");

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // --- CẬP NHẬT THÔNG TIN MỚI ---
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.avatar = req.body.avatar || user.avatar;
      user.bio = req.body.bio || user.bio;
      // -----------------------------

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,

        // --- TRẢ VỀ THÔNG TIN MỚI CHO FRONTEND ---
        phone: updatedUser.phone,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        // -----------------------------------------

        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateUserProfile };
