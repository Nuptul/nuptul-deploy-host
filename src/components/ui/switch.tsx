import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, style, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
      backdropFilter: 'blur(15px) saturate(2)',
      WebkitBackdropFilter: 'blur(15px) saturate(2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(0, 0, 0, 0.05)',
      minHeight: '28px',
      minWidth: '48px',
      ...style
    }}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full shadow-lg ring-0 transition-all duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
      style={{
        background: props.checked 
          ? 'linear-gradient(135deg, rgba(69, 183, 209, 0.9) 0%, rgba(78, 205, 196, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
        backdropFilter: 'blur(10px) saturate(2)',
        WebkitBackdropFilter: 'blur(10px) saturate(2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
      }}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
