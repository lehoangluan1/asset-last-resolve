import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { label: string; className: string }> = {
  'in-use': { label: 'In Use', className: 'bg-success/10 text-success border-success/20' },
  'in-storage': { label: 'In Storage', className: 'bg-info/10 text-info border-info/20' },
  'under-maintenance': { label: 'Under Maintenance', className: 'bg-warning/10 text-warning border-warning/20' },
  'pending-disposal': { label: 'Pending Disposal', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'disposed': { label: 'Disposed', className: 'bg-muted text-muted-foreground border-border' },
  'borrowed': { label: 'Borrowed', className: 'bg-secondary/10 text-secondary border-secondary/20' },
  'excellent': { label: 'Excellent', className: 'bg-success/10 text-success border-success/20' },
  'good': { label: 'Good', className: 'bg-success/10 text-success border-success/20' },
  'fair': { label: 'Fair', className: 'bg-warning/10 text-warning border-warning/20' },
  'poor': { label: 'Poor', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'non-functional': { label: 'Non-Functional', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'pending': { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  'completed': { label: 'Completed', className: 'bg-success/10 text-success border-success/20' },
  'cancelled': { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' },
  'draft': { label: 'Draft', className: 'bg-muted text-muted-foreground border-border' },
  'pending-approval': { label: 'Pending Approval', className: 'bg-warning/10 text-warning border-warning/20' },
  'approved': { label: 'Approved', className: 'bg-success/10 text-success border-success/20' },
  'rejected': { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'checked-out': { label: 'Checked Out', className: 'bg-info/10 text-info border-info/20' },
  'returned': { label: 'Returned', className: 'bg-success/10 text-success border-success/20' },
  'overdue': { label: 'Overdue', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'active': { label: 'Active', className: 'bg-success/10 text-success border-success/20' },
  'inactive': { label: 'Inactive', className: 'bg-muted text-muted-foreground border-border' },
  'locked': { label: 'Locked', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'matched': { label: 'Verified', className: 'bg-success/10 text-success border-success/20' },
  'discrepancy': { label: 'Discrepancy', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'missing': { label: 'Missing', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'damaged': { label: 'Damaged', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'skipped': { label: 'Skipped', className: 'bg-muted text-muted-foreground border-border' },
  'low': { label: 'Low', className: 'bg-info/10 text-info border-info/20' },
  'medium': { label: 'Medium', className: 'bg-warning/10 text-warning border-warning/20' },
  'high': { label: 'High', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'critical': { label: 'Critical', className: 'bg-destructive text-destructive-foreground border-destructive' },
  'open': { label: 'Open', className: 'bg-warning/10 text-warning border-warning/20' },
  'investigating': { label: 'Investigating', className: 'bg-info/10 text-info border-info/20' },
  'resolved': { label: 'Resolved', className: 'bg-success/10 text-success border-success/20' },
  'escalated': { label: 'Escalated', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'scheduled': { label: 'Scheduled', className: 'bg-info/10 text-info border-info/20' },
  'in-progress': { label: 'In Progress', className: 'bg-warning/10 text-warning border-warning/20' },
  'needs-monitoring': { label: 'Needs Monitoring', className: 'bg-warning/10 text-warning border-warning/20' },
  'under-repair': { label: 'Under Repair', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'not-ready': { label: 'Not Ready', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'proposed': { label: 'Proposed', className: 'bg-warning/10 text-warning border-warning/20' },
  'under-review': { label: 'Under Review', className: 'bg-info/10 text-info border-info/20' },
  'deferred': { label: 'Deferred', className: 'bg-muted text-muted-foreground border-border' },
  'permanent': { label: 'Permanent', className: 'bg-primary/10 text-primary border-primary/20' },
  'temporary': { label: 'Temporary', className: 'bg-secondary/10 text-secondary border-secondary/20' },
  'borrow': { label: 'Borrow', className: 'bg-info/10 text-info border-info/20' },
  'normal': { label: 'Normal', className: 'bg-muted text-muted-foreground border-border' },
  'urgent': { label: 'Urgent', className: 'bg-destructive text-destructive-foreground border-destructive' },
  'warning': { label: 'Warning', className: 'bg-warning/10 text-warning border-warning/20' },
  'admin': { label: 'Admin', className: 'bg-primary/10 text-primary border-primary/20' },
  'officer': { label: 'Officer', className: 'bg-info/10 text-info border-info/20' },
  'manager': { label: 'Manager', className: 'bg-success/10 text-success border-success/20' },
  'employee': { label: 'Employee', className: 'bg-muted text-muted-foreground border-border' },
  'technician': { label: 'Technician', className: 'bg-warning/10 text-warning border-warning/20' },
  'auditor': { label: 'Auditor', className: 'bg-secondary/10 text-secondary border-secondary/20' },
};

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground border-border' };
  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium capitalize', config.className, className)}>
      {label || config.label}
    </Badge>
  );
}
