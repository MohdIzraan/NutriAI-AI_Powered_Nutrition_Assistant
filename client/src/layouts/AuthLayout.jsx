import { Link, Outlet } from 'react-router-dom';
import { Leaf, Zap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">NutriAI</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-400">
        <p>
          NutriAI provides general wellness information only.
          Not a substitute for professional medical or nutritional advice.
        </p>
      </footer>
    </div>
  );
}
