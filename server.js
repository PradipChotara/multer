// Import express
const express = require("express");
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const currentDate = getCurrentDateTime();
    const folderPath = `./uploads/${currentDate}`;
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to API");
});

app.post("/upload", upload.single("myFile"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.send("File successfully uploaded.");
  } catch (error) {
    res.status(500).send("An error occurred while uploading the file.");
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port : ${PORT}`);
});

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(4, '0');

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;
}
