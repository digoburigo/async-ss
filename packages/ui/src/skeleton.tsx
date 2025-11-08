import type { ComponentProps } from "react";

import { cn } from "@acme/ui";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-accent animate-pulse rounded-md", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
