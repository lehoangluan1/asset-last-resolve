import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'primary' | 'muted';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
  primary: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
  primary: 'bg-primary',
  muted: 'bg-muted-foreground',
};

export function StatusBadge({ label, variant = 'default', className, dot = false }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', variantStyles[variant], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotStyles[variant])} />}
      {label}
    </span>
  );
}

// Convenience mappings
export function conditionBadge(condition: string) {
  const map: Record<string, BadgeVariant> = {
    new: 'primary',
    good: 'success',
    fair: 'warning',
    'needs-repair': 'destructive',
    'not-operational': 'destructive',
  };
  return <StatusBadge label={condition.replace('-', ' ')} variant={map[condition] ?? 'default'} dot />;
}

export function lifecycleBadge(lifecycle: string) {
  const map: Record<string, BadgeVariant> = {
    'in-use': 'success',
    'in-storage': 'info',
    'under-maintenance': 'warning',
    'pending-disposal': 'destructive',
    disposed: 'muted',
  };
  return <StatusBadge label={lifecycle.replace(/-/g, ' ')} variant={map[lifecycle] ?? 'default'} />;
}

export function severityBadge(severity: string) {
  const map: Record<string, BadgeVariant> = { low: 'info', medium: 'warning', high: 'destructive', critical: 'destructive' };
  return <StatusBadge label={severity} variant={map[severity] ?? 'default'} dot />;
}

export function campaignStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = { draft: 'muted', active: 'primary', completed: 'success', cancelled: 'destructive' };
  return <StatusBadge label={status} variant={map[status] ?? 'default'} dot />;
}

export function discrepancyStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = { open: 'destructive', investigating: 'warning', resolved: 'success', escalated: 'destructive' };
  return <StatusBadge label={status} variant={map[status] ?? 'default'} dot />;
}

export function disposalStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = { proposed: 'info', 'under-review': 'warning', approved: 'success', rejected: 'destructive', completed: 'muted', deferred: 'muted' };
  return <StatusBadge label={status.replace(/-/g, ' ')} variant={map[status] ?? 'default'} />;
}

export function maintenanceStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = { good: 'success', 'needs-monitoring': 'warning', 'under-repair': 'info', 'not-ready': 'destructive' };
  return <StatusBadge label={status.replace(/-/g, ' ')} variant={map[status] ?? 'default'} dot />;
}
