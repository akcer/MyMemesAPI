const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const multerConfig = (folderName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./uploads/${folderName}`);
    },
    filename: (req, file, cb) => {
      crypto.pseudoRandomBytes(16, (err, raw) => {
        if (err) return cb(err);

        cb(null, raw.toString('hex') + path.extname(file.originalname));
      });
    },
  });
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      if (
        ext !== '.png' &&
        ext !== '.jpg' &&
        ext !== '.gif' &&
        ext !== '.jpeg'
      ) {
        return cb(new Error('Only images are allowed'));
      }
      cb(null, true);
    },
  });
  return upload;
};

module.exports = multerConfig;
