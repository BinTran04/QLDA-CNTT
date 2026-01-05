const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // 2. Tạo user mới (Password sẽ tự mã hóa nhờ file User.js ta vừa sửa lúc nãy)
    const user = await User.create({
      name,
      email,
      password,
    });

    // 3. Trả về thông tin + Token để đăng nhập luôn
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đăng nhập & lấy Token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Kiểm tra email có tồn tại & password có khớp không
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authUser, registerUser };
