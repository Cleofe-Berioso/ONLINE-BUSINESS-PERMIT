import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
            {props.required && <span className="ml-1 text-[var(--danger)]">*</span>}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            "block w-full rounded-lg border px-4 py-2.5 bg-[var(--surface-muted)] text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20"
              : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
