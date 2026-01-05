const Itinerary = require("../models/Itinerary");

// @desc    Tạo lịch trình mới
// @route   POST /api/itineraries
const createItinerary = async (req, res) => {
  // 1. Đổi destinations thành places
  const { title, startDate, endDate, places } = req.body;

  try {
    const itinerary = new Itinerary({
      user: req.user._id,
      title,
      startDate,
      endDate,
      // 2. Lưu vào trường places (nếu không có thì để mảng rỗng)
      places: places || [],
    });

    const createdItinerary = await itinerary.save();
    res.status(201).json(createdItinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách lịch trình CỦA TÔI
// @route   GET /api/itineraries
const getMyItineraries = async (req, res) => {
  try {
    // 3. Sửa populate: Dùng 'places' thay vì 'destinations.place'
    const itineraries = await Itinerary.find({ user: req.user._id }).populate(
      "places"
    );

    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy chi tiết 1 chuyến đi
// @route   GET /api/itineraries/:id
const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate("user", "name email")
      .populate("places"); // Hàm này bạn đã viết đúng rồi

    if (!itinerary) {
      return res.status(404).json({ message: "Không tìm thấy chuyến đi" });
    }
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Thêm địa điểm vào chuyến đi
// @route   POST /api/itineraries/:id/places
const addPlaceToItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (itinerary) {
      const { placeId } = req.body;

      if (!itinerary.places) {
        itinerary.places = [];
      }

      // Kiểm tra trùng lặp
      // Lưu ý: itinerary.places lúc này là mảng Object (do populate) hoặc ObjectId
      // Cách an toàn nhất để check trùng ID:
      const alreadyAdded = itinerary.places.find(
        (p) => p.toString() === placeId || p._id?.toString() === placeId
      );

      if (alreadyAdded) {
        return res
          .status(400)
          .json({ message: "Địa điểm này đã có trong lịch trình rồi" });
      }

      itinerary.places.push(placeId);
      await itinerary.save();
      res.json({ message: "Đã thêm địa điểm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy chuyến đi" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createItinerary,
  getMyItineraries,
  getItineraryById,
  addPlaceToItinerary,
};
