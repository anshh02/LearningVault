import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function DocumentViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [documentData, setDocumentData] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    
    // AI States
    const [summary, setSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [concept, setConcept] = useState('');
    const [explanation, setExplanation] = useState('');
    const [loadingExplanation, setLoadingExplanation] = useState(false);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                setDocumentData(res.data);
            } catch (error) {
                alert('Failed to load document details');
                navigate('/documents');
            }
        };
        fetchDocument();
    }, [id, navigate]);

    const handleGenerateSummary = async () => {
        setLoadingSummary(true);
        try {
            const res = await api.post(`/ai/summary/${id}`);
            setSummary(res.data.summary);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to generate summary');
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleExplainConcept = async (e) => {
        e.preventDefault();
        if (!concept.trim()) return;
        setLoadingExplanation(true);
        try {
            const res = await api.post('/ai/explain', { concept });
            setExplanation(res.data.explanation);
        } catch (error) {
            alert('Failed to explain concept');
        } finally {
            setLoadingExplanation(false);
        }
    };

    if (!documentData) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto mt-8 p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: PDF VIEWER (Takes up 2/3 of space) */}
            <div className="lg:col-span-2">
                <div className="bg-white p-4 rounded shadow-sm border mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 truncate">{documentData.title}</h1>
                    <button onClick={() => navigate('/documents')} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                        Back
                    </button>
                </div>

                <div className="bg-gray-800 p-2 flex justify-between items-center text-white text-sm">
                    <div className="flex gap-2">
                        <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))} className="px-2 py-1 bg-gray-600 rounded">Prev</button>
                        <span className="py-1">Page {pageNumber} of {numPages}</span>
                        <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} className="px-2 py-1 bg-gray-600 rounded">Next</button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setScale(s => Math.max(s - 0.25, 0.5))} className="px-2 py-1 bg-gray-600 rounded">-</button>
                        <span className="py-1">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(s + 0.25, 2.5))} className="px-2 py-1 bg-gray-600 rounded">+</button>
                    </div>
                </div>

                <div className="bg-gray-100 border border-t-0 flex justify-center overflow-auto" style={{ height: '75vh' }}>
                    <Document file={`http://localhost:5000${documentData.file_url}`} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                        <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} />
                    </Document>
                </div>
            </div>

            {/* RIGHT COLUMN: AI FEATURES */}
            <div className="flex flex-col gap-6" style={{ height: '85vh', overflowY: 'auto' }}>
                
                {/* Summary Section */}
                <div className="bg-white p-5 rounded shadow-sm border">
                    <h2 className="text-xl font-bold mb-4 text-blue-700">AI Summary</h2>
                    {!summary ? (
                        <button 
                            onClick={handleGenerateSummary} 
                            disabled={loadingSummary}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loadingSummary ? 'Reading Document...' : 'Generate Summary'}
                        </button>
                    ) : (
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                            {summary}
                        </div>
                    )}
                </div>

                {/* Concept Explainer Section */}
                <div className="bg-white p-5 rounded shadow-sm border">
                    <h2 className="text-xl font-bold mb-4 text-green-700">Concept Explainer</h2>
                    <form onSubmit={handleExplainConcept} className="mb-4">
                        <input 
                            type="text" 
                            placeholder="Enter a concept from the text..." 
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            className="w-full px-3 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={loadingExplanation}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                        >
                            {loadingExplanation ? 'Thinking...' : 'Explain'}
                        </button>
                    </form>
                    
                    {explanation && (
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap border-t pt-4 mt-4">
                            {explanation}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}