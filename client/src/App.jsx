import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import { Spinner } from './components/ui';

// Pages
import Landing          from './pages/Landing';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import FoodRecognition  from './pages/FoodRecognition';
import MealAnalyzer     from './pages/MealAnalyzer';
import DietPlanner      from './pages/DietPlanner';
import DietPlanList     from './pages/DietPlanList';
import DietPlanDetails  from './pages/DietPlanDetails';
import AIAssistant      from './pages/AIAssistant';
import MealHistory      from './pages/MealHistory';
import Analytics        from './pages/Analytics';
import Profile          from './pages/Profile';
import Settings         from './pages/Settings';
import About            from './pages/About';
import NotFound         from './pages/NotFound';

// Route Guards 
function RequireAuth({ children }) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <Spinner size="lg" className="text-primary-500" />
          <p className="text-xs text-gray-400">Loading NutriAI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function RequireGuest({ children }) {
  const { user, initialized, loading } = useAuth();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// App Routes 
export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Landing />} />

      {/* Auth routes — redirect to dashboard if already logged in */}
      <Route
        element={
          <RequireGuest>
            <AuthLayout />
          </RequireGuest>
        }
      >
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected app routes — redirect to login if not logged in */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/food"           element={<FoodRecognition />} />
        <Route path="/meal-analyzer"  element={<MealAnalyzer />} />
        <Route path="/diet"           element={<DietPlanList />} />
        <Route path="/diet/new"       element={<DietPlanner />} />
        <Route path="/diet/:id"       element={<DietPlanDetails />} />
        <Route path="/assistant"      element={<AIAssistant />} />
        <Route path="/history"        element={<MealHistory />} />
        <Route path="/analytics"      element={<Analytics />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="/settings"       element={<Settings />} />
        <Route path="/about"          element={<About />} />
      </Route>

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}