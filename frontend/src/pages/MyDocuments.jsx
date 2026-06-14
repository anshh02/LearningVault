import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';


export default function MyDocuments() {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // const fileBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    

    useEffect(() => {
        const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents');
            setDocuments(res.data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        }
    };

        fetchDocuments();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== id));
        } catch (error) {
            console.error('Failed to delete document', error);
            alert('Failed to delete');
        }
    };

    // Search filter logic
    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">My Documents</h2>
                <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    + Upload New PDF
                </Link>
            </div>

            <input 
                type="text" 
                placeholder="Search documents by title or description..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 mb-8 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {filteredDocs.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No documents found. Start uploading!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map(doc => (
                        <div key={doc.id} className="p-5 bg-white border rounded shadow-sm hover:shadow-md transition">
                            <h3 className="text-xl font-semibold mb-2 truncate">{doc.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doc.description || 'No description provided.'}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                                <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <Link 
                                    to={`/document/${doc.id}`}
                                    className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
                                >
                                    Open Viewer
                                </Link>
                                <button 
                                    onClick={() => handleDelete(doc.id)}
                                    className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}