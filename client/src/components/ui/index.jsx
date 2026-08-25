import { forwardRef } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { classNames } from '../../utils/formatters';

// Button 
export const Button = forwardRef(({ variant = 'primary', size = 'md', loading = false, children, className, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary:   'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500',
    secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-200 focus:ring-gray-300',
    ghost:     'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300',
    danger:    'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    accent:    'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400',
  };
  return (
    <button ref={ref} className={classNames(base, sizes[size], variants[variant], className)} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

// Spinner 
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-8 w-8', xl: 'h-12 w-12' };
  return (
    <svg className={classNames('animate-spin', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

// Input 
export const Input = forwardRef(({ label, error, hint, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="form-label">{label}</label>}
    <input ref={ref} className={classNames('form-input', error && 'border-red-400 focus:border-red-400 focus:ring-red-400', className)} {...props} />
    {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" />{error}</p>}
  </div>
));
Input.displayName = 'Input';

// Select 
export const Select = forwardRef(({ label, error, children, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="form-label">{label}</label>}
    <select ref={ref} className={classNames('form-input pr-8 appearance-none cursor-pointer', error && 'border-red-400', className)} {...props}>
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" />{error}</p>}
  </div>
));
Select.displayName = 'Select';

// Textarea 
export const Textarea = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="form-label">{label}</label>}
    <textarea ref={ref} className={classNames('form-input resize-none', error && 'border-red-400', className)} {...props} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// Card 
export const Card = ({ children, className, onClick, ...props }) => (
  <div
    className={classNames('card', onClick && 'cursor-pointer hover:shadow-card-hover transition-shadow duration-200', className)}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

// Badge 
export const Badge = ({ children, variant = 'gray', className }) => {
  const variants = {
    green:  'bg-primary-50 text-primary-700',
    amber:  'bg-accent-50 text-accent-700',
    blue:   'bg-blue-50 text-blue-700',
    red:    'bg-red-50 text-red-700',
    gray:   'bg-gray-100 text-gray-600',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={classNames('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

// Alert 
const alertConfig = {
  info:    { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: <Info className="h-4 w-4 text-blue-500 shrink-0" /> },
  success: { bg: 'bg-primary-50 border-primary-200', text: 'text-primary-800', icon: <CheckCircle className="h-4 w-4 text-primary-500 shrink-0" /> },
  warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> },
  error:   { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" /> },
};

export const Alert = ({ type = 'info', children, className }) => {
  const { bg, text, icon } = alertConfig[type];
  return (
    <div className={classNames('flex items-start gap-2.5 p-3 rounded-lg border text-sm', bg, text, className)}>
      {icon}
      <div className="flex-1">{children}</div>
    </div>
  );
};

// Modal 
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', '2xl': 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={classNames('relative bg-white rounded-2xl shadow-2xl w-full animate-slide-up', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {!title && (
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// Progress Bar 
export const ProgressBar = ({ value, max = 100, color = 'bg-primary-500', className }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const overColor = pct >= 100 ? 'bg-red-500' : color;
  return (
    <div className={classNames('progress-bar', className)}>
      <div className={classNames('progress-fill', overColor)} style={{ width: `${pct}%` }} />
    </div>
  );
};

// Skeleton 
export const Skeleton = ({ className }) => <div className={classNames('skeleton', className)} />;

export const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

// Empty State 
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    {icon && <div className="text-4xl mb-4 opacity-40">{icon}</div>}
    <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 max-w-xs mb-4">{description}</p>}
    {action}
  </div>
);

// Demo Banner 
export const DemoBanner = ({ className }) => (
  <div className={classNames('demo-banner', className)}>
    <span className="text-amber-500">⚠️</span>
    <span>
      <strong>Demo Mode</strong> — AI responses are pre-configured samples.
      Set <code className="font-mono text-xs">AI_MODE=production</code> for real AI inference.
    </span>
  </div>
);

// Disclaimer 
export const Disclaimer = ({ className }) => (
  <div className={classNames('flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500', className)}>
    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
    <span>
      AI-generated nutritional estimates. Values are approximate and may not be accurate for all foods and portions.
      Not a substitute for professional medical or nutritional advice.
    </span>
  </div>
);

// Nutrition Macro Row 
export const MacroRow = ({ label, value, unit = 'g', color, progress, max }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-gray-600">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-medium text-gray-800">{value}{unit}</span>
    </div>
    {max != null && <ProgressBar value={value} max={max} color={color ? undefined : 'bg-primary-500'} className="h-1.5" />}
  </div>
);

// Page Header 
export const PageHeader = ({ title, subtitle, actions, backHref }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      {backHref && (
        <a href={backHref} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-1 transition-colors">
          ← Back
        </a>
      )}
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

// Step Indicator 
export const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center gap-1 mb-6">
    {steps.map((step, i) => (
      <div key={i} className="flex items-center gap-1">
        <div className={classNames(
          'flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold transition-all',
          i < current ? 'bg-primary-600 text-white' :
          i === current ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600 ring-offset-1' :
          'bg-gray-100 text-gray-400'
        )}>
          {i < current ? '✓' : i + 1}
        </div>
        {i < steps.length - 1 && (
          <div className={classNames('h-0.5 w-8', i < current ? 'bg-primary-500' : 'bg-gray-200')} />
        )}
      </div>
    ))}
  </div>
);
