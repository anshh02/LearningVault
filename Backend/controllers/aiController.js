const path = require('path');
const db = require('../config/db');
const aiService = require('../services/aiService');

exports.getOrGenerateSummary = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        // 1. Verify user owns the document
        const docQuery = await db.query('SELECT * FROM documents WHERE id = $1 AND user_id = $2', [documentId, userId]);
        if (docQuery.rows.length === 0) return res.status(404).json({ message: 'Document not found' });
        const document = docQuery.rows[0];

        // 2. Check if summary already exists in DB
        const summaryQuery = await db.query('SELECT * FROM summaries WHERE document_id = $1', [documentId]);
        if (summaryQuery.rows.length > 0) {
            return res.json({ summary: summaryQuery.rows[0].summary });
        }

        // 3. Format the file path safely for Windows
        const safeFilePath = document.file_url.startsWith('/') ? document.file_url.slice(1) : document.file_url;
        const filePath = path.join(__dirname, '..', safeFilePath);
        
        // 4. Send the file path directly to our upgraded Gemini service!
        const generatedSummary = await aiService.generateDocumentSummary(filePath);

        // 5. Save to DB and return
        await db.query(
            'INSERT INTO summaries (document_id, summary) VALUES ($1, $2)',
            [documentId, generatedSummary]
        );

        res.json({ summary: generatedSummary });
    } catch (error) {
        console.error('AI Summary Error:', error);
        res.status(500).json({ message: 'Failed to generate summary' });
    }
};

exports.explainConcept = async (req, res) => {
    try {
        const { concept } = req.body;
        if (!concept) return res.status(400).json({ message: 'Concept is required' });

        const explanation = await aiService.explainConcept(concept);
        res.json({ explanation });
    } catch (error) {
        console.error('AI Explainer Error:', error);
        res.status(500).json({ message: 'Failed to explain concept' });
    }
};