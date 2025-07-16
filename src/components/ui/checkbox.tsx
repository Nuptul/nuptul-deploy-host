import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    style={{
      background: props.checked ? 'linear-gradient(135deg, rgba(69, 183, 209, 0.9) 0%, rgba(78, 205, 196, 0.8) 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
      backdropFilter: 'blur(10px) saturate(2)',
      WebkitBackdropFilter: 'blur(10px) saturate(2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: props.checked ? '0 2px 8px rgba(69, 183, 209, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)' : 'inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(0, 0, 0, 0.05)'
    }}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
