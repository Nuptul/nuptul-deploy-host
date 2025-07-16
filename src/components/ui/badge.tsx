import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const glassStyle = {
    background: variant === 'default' 
      ? 'linear-gradient(135deg, rgba(69, 183, 209, 0.9) 0%, rgba(78, 205, 196, 0.8) 100%)'
      : variant === 'destructive'
      ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(255, 154, 0, 0.8) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
    backdropFilter: 'blur(10px) saturate(2)',
    WebkitBackdropFilter: 'blur(10px) saturate(2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: variant === 'default' || variant === 'destructive' ? '#FFFFFF' : '#000000',
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 12px',
    ...style
  };
  
  return (
    <div 
      className={cn("inline-flex items-center rounded-full transition-all duration-200 hover:scale-105", className)} 
      style={glassStyle}
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
