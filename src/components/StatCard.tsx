import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-card border-l-4 border-l-primary',
  success: 'bg-card border-l-4 border-l-success',
  warning: 'bg-card border-l-4 border-l-warning',
  destructive: 'bg-card border-l-4 border-l-destructive',
  info: 'bg-card border-l-4 border-l-info',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border p-5 shadow-sm animate-fade-in', variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs font-medium', trend.value >= 0 ? 'text-success' : 'text-destructive')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-2.5', iconVariantStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
