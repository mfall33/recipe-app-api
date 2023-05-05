const path = require('node:path');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname.substring(0, 6) + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase())
    }
});

const fileFilter = function (req, file, cb) {
    // Check if the file type is supported
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error('Only .png and .jpeg format allowed!'));
    }
};

const imageUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        filesize: 1024 * 1024 * 5
    }
}).array('files', 3);

module.exports = imageUpload;