// Import express
const express = require("express");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage })

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to API");
});

app.post("/upload", upload.single("myFile"), (req, res) => {
  console.log("Body: ", req.body);
  console.log("File: ", req.file);
  res.send("File successfully uploaded.");
});

app.listen(PORT, () => {
  console.log(`Server started on port : ${PORT}`);
});
