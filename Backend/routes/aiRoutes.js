const express = require('express');
const { getOrGenerateSummary, explainConcept } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/summary/:documentId', getOrGenerateSummary);
router.post('/explain', explainConcept);

module.exports = router;