const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const Category = require("../models/category");
const Podcast = require("../models/podcast");
const User = require("../models/user");

const router = require("express").Router();

// add-podcast
router.post("/add-podcast", authMiddleware, upload, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const frontImage = req.files("frontImage")[0].path;
    const audioFile = req.files("audioFile")[0].path;

    if (!title || !description || !category || !frontImage || !audiofile) {
      return res.status(400).json({ message: "All Feilds are required!" });
    }

    const { user } = req;

    const cat = await Category.findOne({ categoryName: category });

    if (!cat) {
      return res.status(400).json({ message: "Invalid Category!" });
    }

    const catId = cat._id;
    const userId = user._id;

    const newPodcast = new Podcast({
      title,
      description,
      category: catId,
      frontImage,
      audioFile,
      user: userId,
    });

    await newPodcast.save();
    await Category.findByIdAndUpdate(catId, {
      $push: { podcasts: newPodcast._id },
    });
    await User.findByIdAndUpdate(userId, {
      $push: { podcasts: newPodcast._id },
    });
    res.status(201).json({ message: "Podcast Created succesfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

// get-all-podcasts
router.get("/get-podcasts", async (req, res) => {
  try {
    const podcasts = await Podcast.find()
      .populate("category")
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: podcasts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
});

// get-user-podcasts
router.get("/get-user-podcasts", authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const userId = user._id;
    const data = await User.findById(userId)
      .populate({ pasth: "podcast", populate: { path: "category" } })
      .select("-password");
    if (date && date.podcasts) {
      data.podcasts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return res.status(200).json({ data: data.podcasts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
});

// get-podcast-by-id
router.get("/get-podcast/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await Podcast.findById(id).populate("category");
    return res.status(200).json({ data: podcast });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
});

// get-podcast-by-category
router.get("/get-podcast/:cat", async (req, res) => {
  try {
    const { cat } = req.params;
    const categories = await Category.find({ categoryName: cat }).populate({
      path: "podcasts",
      populate: { path: "category" },
    });

    let podcasts = [];

    categories.forEach((category) => {
      podcasts = [...podcasts, ...category.podcasts];
    });

    return res.status(200).json({ data: podcasts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
