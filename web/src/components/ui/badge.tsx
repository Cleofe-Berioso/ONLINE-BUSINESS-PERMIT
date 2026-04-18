import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
        primary: "bg-[var(--accent-light)] text-[var(--accent)]",
        success: "bg-[var(--success-light)] text-[var(--success)]",
        warning: "bg-[var(--warning-light)] text-[var(--warning)]",
        danger: "bg-[var(--danger-light)] text-[var(--danger)]",
        info: "bg-[var(--accent-light)] text-[var(--accent)]",
        purple: "bg-purple-100 text-purple-800",
        orange: "bg-orange-100 text-orange-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

/**
 * Map application/document/permit status to badge variant
 */
export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    DRAFT: "default",
    SUBMITTED: "primary",
    UNDER_REVIEW: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    CANCELLED: "default",
    ACTIVE: "success",
    EXPIRED: "orange",
    REVOKED: "danger",
    RENEWED: "info",
    UPLOADED: "primary",
    PENDING_VERIFICATION: "warning",
    VERIFIED: "success",
    PREPARED: "info",
    ISSUED: "primary",
    RELEASED: "purple",
    COMPLETED: "success",
    TEMPORARY: "warning",
    CONFIRMED: "success",
    RESCHEDULED: "info",
    GENERATED: "primary",
    CLAIMED: "success",
  };

  const displayLabel = status.replace(/_/g, " ");

  return <Badge variant={variantMap[status] || "default"}>{displayLabel}</Badge>;
}
