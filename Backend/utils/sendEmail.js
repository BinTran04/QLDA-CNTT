const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message }) => {
  // 1. Cấu hình "Người đưa thư" (Transporter)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tranquocnhut2004@gmail.com", // <--- Thay bằng Gmail của bạn
      pass: "vwdp ivmz fxdo zzxh", // <--- Thay bằng App Password (16 ký tự)
    },
  });

  // 2. Cấu hình nội dung thư
  const mailOptions = {
    from: '"TripPlanner Support" <no-reply@tripplanner.com>', // Tên người gửi
    to: email, // Gửi đến ai?
    subject: subject, // Tiêu đề
    html: message, // Nội dung (hỗ trợ HTML)
  };

  // 3. Gửi đi
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
