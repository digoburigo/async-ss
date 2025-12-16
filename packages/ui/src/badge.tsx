import { cn } from "@acme/ui";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        warning:
          "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90",
        confirmed:
          "border-transparent bg-green-400 text-black [a&]:hover:bg-green-400/90",
        info: "border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90",
        muted:
          "border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/90",
        accent:
          "border-transparent bg-accent text-accent-foreground [a&]:hover:bg-accent/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? SlotPrimitive.Slot : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
