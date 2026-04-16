import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, i) => (
        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 && (
            <div className="absolute left-[11px] top-7 h-full w-px bg-border" />
          )}
          <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground">
            {item.icon || <div className="h-2 w-2 rounded-full bg-muted-foreground" />}
          </div>
          <div className="flex-1 space-y-1 pt-0.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.badge}
            </div>
            {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
            <p className="text-xs text-muted-foreground">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
