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
    bg: "bg-blue-50 border-blue-200",
    icon: <Info className="h-5 w-5 text-blue-600" />,
    title: "text-blue-800",
    text: "text-blue-700",
  },
  success: {
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    title: "text-green-800",
    text: "text-green-700",
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-200",
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    title: "text-yellow-800",
    text: "text-yellow-700",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    title: "text-red-800",
    text: "text-red-700",
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
