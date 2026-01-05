const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Các thông tin cá nhân
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    avatar: { type: String, default: "" }, // Link ảnh đại diện (hoặc Base64)
    bio: { type: String, default: "" },

    isAdmin: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

// --- SỬA LỖI TẠI ĐÂY (PHONG CÁCH ASYNC MỚI) ---
// Bỏ tham số 'next' trong ngoặc đơn đi
userSchema.pre("save", async function () {
  // 1. Nếu mật khẩu KHÔNG thay đổi -> Thoát luôn (Return)
  if (!this.isModified("password")) {
    return;
  }

  // 2. Nếu mật khẩu CÓ thay đổi -> Mã hóa
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Không cần gọi next(), Mongoose tự biết khi hàm này chạy xong
});
// ----------------------------------------------

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
