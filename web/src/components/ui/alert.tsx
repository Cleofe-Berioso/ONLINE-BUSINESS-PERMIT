import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  info: {
    bg: "bg-[var(--accent-light)] border-l-4 border-[var(--accent)]",
    icon: <Info className="h-5 w-5 text-[var(--accent)]" />,
    title: "text-[var(--accent)]",
    text: "text-[var(--text-primary)]",
  },
  success: {
    bg: "bg-[var(--success-light)] border-l-4 border-[var(--success)]",
    icon: <CheckCircle className="h-5 w-5 text-[var(--success)]" />,
    title: "text-[var(--success)]",
    text: "text-[var(--text-primary)]",
  },
  warning: {
    bg: "bg-[var(--warning-light)] border-l-4 border-[var(--warning)]",
    icon: <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />,
    title: "text-[var(--warning)]",
    text: "text-[var(--text-primary)]",
  },
  error: {
    bg: "bg-[var(--danger-light)] border-l-4 border-[var(--danger)]",
    icon: <AlertCircle className="h-5 w-5 text-[var(--danger)]" />,
    title: "text-[var(--danger)]",
    text: "text-[var(--text-primary)]",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4",
        config.bg,
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1">
        {title && (
          <h4 className={cn("mb-1 font-semibold", config.title)}>{title}</h4>
        )}
        <div className={cn("text-sm", config.text)}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded p-1 hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
