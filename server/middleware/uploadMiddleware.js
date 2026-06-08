
const multer = require("multer");
const path = require("path");

// Local storage configuration
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "server/uploads");
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },

});

const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }

};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;