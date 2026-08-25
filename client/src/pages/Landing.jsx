import { Link } from 'react-router-dom';
import {
  Camera, Brain, MapPin, MessageCircle, BarChart2, Shield,
  ChevronRight, Leaf, Zap, Star, Globe, Target, CheckCircle,
  Upload, Sparkles, TrendingUp
} from 'lucide-react';

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-100">
      {children}
    </span>
  );
}

function FeatureCard({ icon: Icon, title, description, color = 'bg-primary-50 text-primary-600' }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className={`inline-flex items-center justify-center h-10 w-10 ${color} rounded-xl mb-4`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ num, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
        {num}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black text-primary-600">{value}</div>
      <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">NutriAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-xs hidden sm:flex">Sign in</Link>
            <Link to="/register" className="btn-primary text-xs">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-white pt-20 pb-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Badge>
            <Zap className="h-3 w-3 text-amber-500" />
            AI-Powered · Regional · Personalized
          </Badge>
          <h1 className="mt-6 text-4xl md:text-5xl font-black text-gray-900 leading-tight text-balance">
            Understand Your Food.<br />
            <span className="text-primary-600">Personalize Your Nutrition.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            An AI-powered platform that recognizes food from photos, estimates nutrition with computer vision,
            and creates personalized <strong>regional Indian diet plans</strong> — tailored to your location, budget, and goals.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-sm px-6 py-3 gap-2">
              <Camera className="h-4 w-4" />Analyze Food Free
            </Link>
            <Link to="/register" className="btn-secondary text-sm px-6 py-3 gap-2">
              <Brain className="h-4 w-4" />Build My Diet Plan
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            <StatCard value="7-Day"   label="AI Diet Plans" />
            <StatCard value="101+"    label="Food Categories" />
            <StatCard value="100%"    label="Personalized" />
          </div>
        </div>
      </section>

      {/* How It Works  */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge><Sparkles className="h-3 w-3" />Simple Process</Badge>
            <h2 className="mt-4 text-3xl font-black text-gray-900">How NutriAI Works</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">From food photo to personalized diet plan in three steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Upload, num: 1, title: 'Upload a Food Photo', desc: 'Take or upload any photo of your food — Indian dishes, restaurant meals, home cooking.' },
              { icon: Brain,  num: 2, title: 'AI Recognizes & Analyzes', desc: 'Computer vision identifies food items. AI estimates calories, protein, carbs, and fat.' },
              { icon: Target, num: 3, title: 'Get Personalized Plans', desc: 'AI generates a 7-day regional diet plan with locally available foods, within your budget.' },
            ].map(({ icon: Icon, num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 bg-primary-600 text-white rounded-2xl mb-4 shadow-lg shadow-primary-200">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-primary-500 mb-1">Step {num}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge><Star className="h-3 w-3" />Everything You Need</Badge>
            <h2 className="mt-4 text-3xl font-black text-gray-900">AI-Powered Nutrition Features</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Camera,      title: 'AI Food Recognition',         color: 'bg-primary-50 text-primary-600',   description: 'Computer vision identifies food items from photos using pretrained ViT models. Provides confidence scores and nutrition estimates.' },
              { icon: MapPin,      title: 'Regional Personalization',    color: 'bg-blue-50 text-blue-600',         description: 'Diet plans use locally available foods from your city and region — Lucknow, Delhi, Chennai, Mumbai — within your budget.' },
              { icon: Brain,       title: 'Generative AI Diet Plans',    color: 'bg-purple-50 text-purple-600',     description: 'AI generates 7-day meal plans using GPT-4o or Claude, with alternatives, preparation hints, and approximate costs.' },
              { icon: MessageCircle, title: 'AI Chat Assistant',         color: 'bg-amber-50 text-amber-600',       description: 'Chat naturally: "Replace paneer with tofu", "Make lunches cheaper", "Use UP foods". AI understands your context.' },
              { icon: BarChart2,   title: 'Nutrition Analytics',         color: 'bg-green-50 text-green-600',       description: 'Weekly calorie charts, macro distribution, protein trends, and progress vs. your targets — all visualized.' },
              { icon: Shield,      title: 'Secure & Private',            color: 'bg-red-50 text-red-600',           description: 'JWT authentication, bcrypt password hashing, rate limiting, and secure API design. Your data stays private.' },
            ].map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* Regional Intelligence */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge><Globe className="h-3 w-3" />Regional Intelligence</Badge>
              <h2 className="mt-4 text-3xl font-black text-gray-900">Personalized for Your Region</h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                NutriAI understands that nutrition isn't one-size-fits-all. A diet plan for different states should feature
                dal, bajra roti, and lauki — not kale smoothies.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  'Prioritizes locally available, seasonal ingredients',
                  'Respects cuisine preferences (North/South/East/West Indian)',
                  'Fits within your daily budget in ₹',
                  'Respects vegetarian, vegan, and eggetarian diets',
                  'AI understands regional food availability',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-xs font-mono text-gray-400 mb-3">Example Profile</div>
              <div className="space-y-2 text-sm">
                {[
                  ['Location', 'Agra, Uttar Pradesh'],
                  ['Goal', 'Weight Loss'],
                  ['Diet', 'Vegetarian'],
                  ['Budget', '₹200/day'],
                  ['Cuisine', 'North Indian'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-500 mb-2">AI generates meals like:</div>
                <div className="space-y-1.5 text-xs text-gray-600">
                  {['🌅 Poha with peanuts + chai', '☀️ Dal + Roti + Tinda sabzi + Curd', '🌙 Moong dal khichdi + Papad'].map(m => (
                    <div key={m} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">{m}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-amber-50 border-y border-amber-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Shield className="h-6 w-6 text-amber-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-amber-900 mb-2">Important Disclaimer</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            NutriAI provides AI-generated nutritional estimates and general wellness information for <strong>educational and informational purposes only</strong>.
            Nutritional values are approximate and may vary based on actual ingredients, preparation methods, and portion sizes.
            This application is <strong>not a medical device</strong> and does not provide medical advice.
            It should not replace consultation with a qualified healthcare professional, registered dietitian, or nutritionist.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Start Understanding Your Food</h2>
          <p className="text-gray-500 mb-8">Get your personalized AI nutrition analysis and regional diet plan for free</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3 gap-2">
            <Leaf className="h-5 w-5" />Get Started — It's Free
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">NutriAI</span>
          </div>
          <p className="text-xs text-center">
            AI-Powered Food Recognition & Regional Nutrition Assistant · For educational purposes only
          </p>
          <div className="flex gap-4 text-xs">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
