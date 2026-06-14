import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <nav className="flex items-center justify-between p-4 bg-white shadow rounded-xl">
                <h1 className="text-xl font-bold">LearnVault Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {user?.name}</span>
                    <button onClick={logout} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">Logout</button>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/documents" className="text-blue-600 hover:underline">My Documents</Link>
                    <Link to="/upload" className="text-blue-600 hover:underline">Upload PDF</Link>
                    <span>Welcome, {user?.name}</span>
                    <button onClick={logout} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">Logout</button>
                </div>

            </nav>
            <div className="mt-8">
                <h2 className="text-2xl font-semibold">Your Study Materials will appear here.</h2>
            </div>
        </div>
    );
}