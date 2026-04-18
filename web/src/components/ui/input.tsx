import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

  return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
            {props.required && <span className="ml-1 text-[var(--danger)]">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "block w-full rounded-lg border px-4 py-2.5 bg-[var(--surface-muted)] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20"
              : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
