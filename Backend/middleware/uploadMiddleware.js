const multer = require('multer');
const path = require('path');

// Configure where and how to save the files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save to the uploads folder
    },
    filename: (req, file, cb) => {
        // Create a unique filename to prevent overwriting files with the same name
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Validate that it is only a PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Not a PDF! Please upload only PDF files.'), false);
    }
};

// Set limits (e.g., 10MB max size)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

module.exports = upload;