import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
      <div className="h-14 w-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
        <Leaf className="h-7 w-7 text-primary-400" />
      </div>
      <h1 className="text-6xl font-black text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Page not found</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
    </div>
  );
}
