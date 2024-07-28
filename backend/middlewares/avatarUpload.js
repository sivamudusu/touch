const fs = require('fs');


function avatarUpload(req, res, next) {
  console.log(req);
  const multer = require('multer');
  const path = require("path");
  const up_folder = path.join(__dirname, "../../assets/userAvatars");
  console.log(up_folder);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(up_folder)) {
        fs.mkdirSync(up_folder, { recursive: true });
      }
      cb(null, up_folder);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });

  const upload = multer({
    storage: storage
  });


  upload.any()(req, res, (err) => {
    if (err) {
        console.log(err);
      res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: err.message,
      });
    } else {
      next();
    }
  });
}

module.exports = avatarUpload;