// Import express
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cron = require('node-cron');
const path = require('path');

let folder = null;

// Schedule a cron job to run every 10 minutes
cron.schedule('* * * * *', () => {
  const directory = './uploads'; // Specify the directory where folders are located
  const cutoffTime = new Date().getTime() - (5 * 60 * 1000); // 5 minutes ago
  deleteFoldersOlderThan(directory, cutoffTime);
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const currentDate = getCurrentDateTime();
    const folderPath = `./uploads/${currentDate}`;
    fs.mkdirSync(folderPath, { recursive: true });
    createTxtFile(folderPath, file);
    folder = folderPath.split("/").pop();
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB (adjusted to bytes)
};
const upload = multer({ storage: storage, limits: limits,});

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Welcome to API");
});

app.post("/upload", upload.single("myFile"), (req, res) => {
  console.log("req handled by ProcessID : ",process.pid);
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    let link = `http://localhost:3000/uploads/${folder}`;
    res.send(link);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send("File size limit exceeded (max: 5MB).");
      }
      return res.status(400).send("Unexpected Multer error.");
    }
    res.status(500).send("An error occurred while uploading the file.");
  }
});

// Serve static files from the specified directory
app.get("/uploads/:folderName", (req, res) => {
  const folderName = req.params.folderName;
  const folderPath = path.join(__dirname, "uploads", folderName);

  // Read the contents of the directory
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    files.forEach( (file) => {
      if(file != "info.txt")
      {
        let filepath = folderPath + "/" + file
        res.sendFile(filepath);
      }
    })
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port : ${PORT}, by ProcessID : ${process.pid}`);
});

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(4, "0");

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;
}

function createTxtFile(folderPath, file) {
  const content = JSON.stringify(file);
  fs.writeFileSync(`${folderPath}/info.txt`, content);
}


function deleteFoldersOlderThan(directory, cutoffTime) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        if (stats.isDirectory() && stats.birthtimeMs < cutoffTime) {
          fs.rmdir(filePath, { recursive: true }, (err) => {
            if (err) {
              console.error('Error deleting folder:', err);
            } else {
              console.log('Folder deleted:', filePath);
            }
          });
        }
      });
    });
  });
}
