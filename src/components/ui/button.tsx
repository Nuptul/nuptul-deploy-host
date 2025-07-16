import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation",
  {
    variants: {
      variant: {
        default: "ios-button-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground min-h-[44px]",
        secondary:
          "ios-button",
        ghost: "hover:bg-accent hover:text-accent-foreground min-h-[44px]",
        link: "text-primary underline-offset-4 hover:underline min-h-[44px]",
        neumorphic: "neu-card hover:shadow-neu-shadow-small active:shadow-neu-shadow-inset min-h-[44px]",
      },
      size: {
        default: "min-h-[44px] px-6 py-3 rounded-xl",
        sm: "min-h-[40px] rounded-lg px-4 py-2 text-sm",
        lg: "min-h-[48px] rounded-xl px-8 py-4 text-base",
        icon: "min-h-[44px] min-w-[44px] rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
