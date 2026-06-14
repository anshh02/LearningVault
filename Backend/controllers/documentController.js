const db = require('../config/db');

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

        const { title, description } = req.body;
        const userId = req.user.id; // Comes from authMiddleware
        const fileUrl = `/uploads/${req.file.filename}`;
        const fileSize = req.file.size;

        const newDoc = await db.query(
            'INSERT INTO documents (user_id, title, description, file_url, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, title, description, fileUrl, fileSize]
        );

        res.status(201).json({ message: 'Document uploaded successfully', document: newDoc.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const docs = await db.query('SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(docs.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching documents' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify the document belongs to the user before deleting
        const doc = await db.query('SELECT * FROM documents WHERE id = $1 AND user_id = $2', [id, userId]);
        if (doc.rows.length === 0) return res.status(404).json({ message: 'Document not found or unauthorized' });

        await db.query('DELETE FROM documents WHERE id = $1', [id]);
        
        // Note: In a production app, you'd also use the 'fs' module to delete the physical file from the 'uploads' folder here.
        
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting document' });
    }
};

exports.getDocumentsByID = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const doc = await db.query('SELECT * FROM documents WHERE id = $1 AND user_id = $2', [id, userId]);
        
        if (doc.rows.length === 0) return res.status(404).json({ message: 'Document not found' });

        res.json(doc.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching document details' });
    }
};