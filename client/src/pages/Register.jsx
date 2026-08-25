import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/ui';
import { Eye, EyeOff, Leaf, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const features = [
  'AI food image recognition',
  'Regional Indian diet plans',
  'Personalized nutrition tracking',
  'AI chat assistant',
];

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ name, email, password }) => {
    setServerError('');
    try {
      await authRegister(name, email, password);
      toast.success('Account created! Complete your profile to get started.');
      navigate('/profile', { state: { onboarding: true } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 bg-primary-600 rounded-xl mb-4">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1.5 text-sm text-gray-500">Get started with AI-powered nutrition</p>
      </div>

      {/* Feature list */}
      <div className="mb-5 grid grid-cols-2 gap-1.5">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
            <CheckCircle className="h-3.5 w-3.5 text-primary-500 shrink-0" />
            {f}
          </div>
        ))}
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && <Alert type="error">{serverError}</Alert>}

          <Input
            label="Full name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="w-full">
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className={`form-input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                {...register('password')}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account…' : 'Create free account'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-400 text-center">
          By creating an account, you agree that NutriAI provides educational nutritional information,
          not medical advice.
        </p>

        <div className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
