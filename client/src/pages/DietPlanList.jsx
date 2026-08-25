import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dietService } from '../services/diet.service';
import { Card, Button, Badge, EmptyState, SkeletonCard, Alert } from '../components/ui';
import { Plus, BookOpen, Wand2, Calendar, Flame } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function DietPlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    dietService.getAll()
      .then(({ data }) => setPlans(data.data.plans))
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Diet Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">{plans.length} plans generated</p>
        </div>
        <Link to="/diet/new" className="btn-primary gap-1.5 text-xs">
          <Wand2 className="h-4 w-4" />Generate Plan
        </Link>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      {plans.length === 0 ? (
        <EmptyState icon="📋" title="No diet plans yet"
          description="Generate your first AI-powered personalized 7-day regional diet plan"
          action={<Link to="/diet/new" className="btn-primary">Generate Diet Plan</Link>} />
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <Card key={plan._id} className="p-4 hover:shadow-card-hover transition-shadow cursor-pointer"
              onClick={() => navigate(`/diet/${plan._id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="h-4.5 w-4.5 text-primary-600" style={{width:'1.125rem',height:'1.125rem'}} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{plan.title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="gray" className="text-xs"><Calendar className="h-3 w-3" />{formatDate(plan.createdAt)}</Badge>
                      {plan.isActive && <Badge variant="green">Active</Badge>}
                      {plan.aiProvider === 'demo' && <Badge variant="amber">Demo</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{plan.days?.length || 7} days</div>
                  <div className="text-xs text-gray-400 mt-0.5">{plan.aiProvider}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
