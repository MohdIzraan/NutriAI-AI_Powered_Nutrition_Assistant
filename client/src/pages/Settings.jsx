import { Card, Alert } from '../components/ui';
import { Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Application preferences and account settings
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            Privacy & Data
          </h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Your nutrition data is stored securely and never sold to
            third parties.
          </p>
          <p>
            AI analysis results are stored to improve your personalised
            recommendations.
          </p>
          <p>
            You can delete your account and all associated data at any
            time by contacting support.
          </p>
        </div>
      </Card>

      <Alert type="warning">
        <strong>Disclaimer:</strong> NutriAI provides AI-generated
        nutritional estimates and general wellness information for
        educational purposes only. It is not medical advice and should
        not replace consultation with a qualified healthcare or nutrition
        professional.
      </Alert>
    </div>
  );
}