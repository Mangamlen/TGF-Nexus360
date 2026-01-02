import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-status-approved text-primary-foreground hover:bg-status-approved/80", // Default to Approved green
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-status-rejected text-destructive-foreground hover:bg-status-rejected/80", // Explicitly use status-rejected
        outline: "text-foreground",
        
        // New status variants based on theme
        approved: "border-transparent bg-status-approved text-primary-foreground hover:bg-status-approved/80",
        pending: "border-transparent bg-status-pending text-primary-foreground hover:bg-status-pending/80",
        rejected: "border-transparent bg-status-rejected text-primary-foreground hover:bg-status-rejected/80",
        locked: "border-transparent bg-status-locked text-primary-foreground hover:bg-status-locked/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
