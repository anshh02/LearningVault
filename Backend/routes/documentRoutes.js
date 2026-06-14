const express = require('express');
const { uploadDocument, getDocuments, deleteDocument, getDocumentsByID } = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentsByID);
router.delete('/:id', deleteDocument);

module.exports = router;