const Place = require("../models/Place");

// @desc    Viết đánh giá mới
// @route   POST /api/places/:id/reviews
// @access  Private
const createPlaceReview = async (req, res) => {
  const { rating, comment } = req.body;
  const place = await Place.findById(req.params.id);

  if (place) {
    // 1. Kiểm tra xem user này đã review chưa (Nếu muốn chặn spam)
    const alreadyReviewed = place.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá địa điểm này rồi!" });
    }

    // 2. Tạo review mới
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    // 3. Đẩy vào mảng và tính toán lại
    place.reviews.push(review);
    place.numReviews = place.reviews.length;

    // Công thức tính điểm trung bình: (Tổng rating / Số lượng)
    place.rating =
      place.reviews.reduce((acc, item) => item.rating + acc, 0) /
      place.reviews.length;

    await place.save();
    res.status(201).json({ message: "Đánh giá đã được thêm" });
  } else {
    res.status(404).json({ message: "Không tìm thấy địa điểm" });
  }
};

// @desc    Lấy tất cả địa điểm (Public)
// @route   GET /api/places
const getPlaces = async (req, res) => {
  try {
    const places = await Place.find({});
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy 1 địa điểm theo ID (Public)
// @route   GET /api/places/:id
const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (place) {
      res.json(place);
    } else {
      res.status(404).json({ message: "Không tìm thấy địa điểm" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- PHẦN DÀNH RIÊNG CHO ADMIN ---

// @desc    Tạo địa điểm mới (Admin)
// @route   POST /api/places
const createPlace = async (req, res) => {
  // Danh sách lấy dữ liệu
  const { name, description, image, price, country, gallery, mapEmbed } =
    req.body;

  try {
    const place = new Place({
      name,
      description,
      image,
      price,
      country,
      gallery: gallery || [], // Lưu gallery (nếu không có thì lưu mảng rỗng)
      mapEmbed,
    });

    const createdPlace = await place.save();
    res.status(201).json(createdPlace);
  } catch (error) {
    res.status(400).json({ message: "Dữ liệu không hợp lệ: " + error.message });
  }
};

// @desc    Cập nhật địa điểm (Admin)
// @route   PUT /api/places/:id
const updatePlace = async (req, res) => {
  const { name, description, image, price, country, gallery, mapEmbed } =
    req.body;

  try {
    const place = await Place.findById(req.params.id);

    if (place) {
      place.name = name || place.name;
      place.description = description || place.description;
      place.image = image || place.image;
      place.price = price || place.price;
      place.country = country || place.country;
      place.gallery = gallery || place.gallery;
      place.mapEmbed = mapEmbed || place.mapEmbed;

      const updatedPlace = await place.save();
      res.json(updatedPlace);
    } else {
      res.status(404).json({ message: "Không tìm thấy địa điểm" });
    }
  } catch (error) {
    res.status(404).json({ message: "Lỗi cập nhật" });
  }
};

// @desc    Xóa địa điểm (Admin)
// @route   DELETE /api/places/:id
const deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (place) {
      await place.deleteOne(); // Xóa khỏi database
      res.json({ message: "Đã xóa địa điểm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy địa điểm" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  createPlaceReview,
};
