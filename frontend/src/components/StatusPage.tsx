import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface StatusPageProps {
  code: string;
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tertiaryAction?: {
    label: string;
    onClick: () => void;
  };
}

function ActionButton({
  label,
  onClick,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  const baseClassName =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors";
  const variantClassName =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-background text-foreground hover:bg-muted";

  return (
    <button type="button" onClick={onClick} className={`${baseClassName} ${variantClassName}`}>
      {label}
    </button>
  );
}

export function StatusPage({
  code,
  title,
  message,
  primaryAction,
  secondaryAction,
  tertiaryAction,
}: StatusPageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const defaultDashboardAction = {
    label: isAuthenticated ? "Go to Dashboard" : "Go to Login",
    onClick: () => navigate(isAuthenticated ? "/" : "/login"),
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-xl rounded-xl border bg-background p-8 shadow-sm">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{code}</p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ActionButton {...(primaryAction ?? defaultDashboardAction)} />
          {secondaryAction ? <ActionButton {...secondaryAction} variant="secondary" /> : null}
          {tertiaryAction ? <ActionButton {...tertiaryAction} variant="secondary" /> : null}
        </div>
      </div>
    </div>
  );
}
