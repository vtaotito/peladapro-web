import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-brand-200 bg-brand-50 text-brand-700",
        secondary: "border-border bg-surface-tertiary text-muted-dark",
        success: "border-green-200 bg-success-light text-green-700",
        warning: "border-amber-200 bg-warning-light text-amber-700",
        danger: "border-red-200 bg-danger-light text-red-700",
        info: "border-blue-200 bg-info-light text-blue-700",
        pitch: "border-transparent bg-pitch text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
