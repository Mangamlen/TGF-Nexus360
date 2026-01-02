import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ className, color = "primary", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-soft-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-[3px]",
      className
    )}
    {...props}
  >
    {/* Subtle Gradient Edge */}
    <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
      background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.05) 0%, transparent 40%), radial-gradient(ellipse at bottom right, rgba(0,0,0,0.05) 0%, transparent 40%)'
    }} />

    {/* Left Accent Strip - appears on hover */}
    <div className={cn("absolute inset-y-0 left-0 w-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100", {
      "bg-primary": color === "primary", // Emerald Green
      "bg-secondary": color === "secondary", // Muted Teal
    })} />
    {props.children}
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pl-4", className)} // Added pl-4
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 pl-4", className)} {...props} /> // Added pl-4
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 pl-4", className)} // Added pl-4
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
