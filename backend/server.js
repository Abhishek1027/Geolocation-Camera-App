const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  const { latitude, longitude } = req.body;
  const imageUrl = `http://localhost:5000/images/${req.file.filename}`;
  res.json({ imageUrl, latitude, longitude });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});