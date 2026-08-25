import { Card } from '../components/ui';
import { Leaf, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">About NutriAI</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          AI-Powered Food Recognition & Regional Nutrition Assistant
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">NutriAI</h2>
            <p className="text-xs text-gray-500">
              Artificial Intelligence Fundamentals
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          NutriAI is a full-stack AI-powered nutrition platform that uses computer
          vision to recognise food from images, estimates nutritional content using
          pretrained models, and generates personalised regional Indian diet plans
          using generative AI — tailored to your location, budget, cuisine
          preferences, and health goals.
        </p>
      </Card>

      <Card className="p-4 bg-amber-50 border-amber-100">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-1">
              Medical Disclaimer
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              NutriAI provides AI-generated nutritional estimates and general
              wellness information for educational and informational purposes only.
              It is not a medical device, does not provide medical advice, and
              should not replace consultation with a qualified healthcare or
              nutrition professional. All nutritional values are approximate
              estimates.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}