import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-blue-100 text-blue-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-indigo-100 text-indigo-800",
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
