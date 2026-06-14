import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function UploadDocument() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a PDF file');

        // We use FormData because we are sending a physical file, not just JSON
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file', file);

        setLoading(true);
        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Upload successful!');
            navigate('/documents');
        } catch (error) {
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Upload Study Material</h2>
            <form onSubmit={handleUpload} className="space-y-4">
                <input 
                    type="text" placeholder="Document Title" value={title} 
                    onChange={(e) => setTitle(e.target.value)} required 
                    className="w-full px-4 py-2 border rounded"
                />
                <textarea 
                    placeholder="Short description (optional)" value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded" rows="3"
                ></textarea>
                <input 
                    type="file" accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])} required
                    className="w-full px-4 py-2 border rounded bg-gray-50"
                />
                <button 
                    type="submit" disabled={loading}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {loading ? 'Uploading...' : 'Upload PDF'}
                </button>
            </form>
        </div>
    );
}