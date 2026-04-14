import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, children, className, breadcrumbs }: PageHeaderProps) {
  return (
    <div className={cn('sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6 py-4', className)}>
      {breadcrumbs && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {b.href ? (
                <a href={b.href} className="hover:text-foreground transition-colors">{b.label}</a>
              ) : (
                <span className="text-foreground font-medium">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
