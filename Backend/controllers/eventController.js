const Event = require("../models/Event");

// @desc    Lấy tất cả sự kiện
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate("place", "name");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents };
