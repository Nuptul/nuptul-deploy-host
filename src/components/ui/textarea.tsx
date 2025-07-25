import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    const glassStyle = {
      background: isFocused 
        ? 'linear-gradient(135deg, rgba(69, 183, 209, 0.3) 0%, rgba(78, 205, 196, 0.2) 50%, rgba(255, 255, 255, 0.25) 100%) !important'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.2) 100%) !important',
      backdropFilter: 'blur(20px) saturate(2) !important',
      WebkitBackdropFilter: 'blur(20px) saturate(2) !important',
      border: isFocused 
        ? '1px solid rgba(69, 183, 209, 0.5) !important'
        : '1px solid rgba(255, 255, 255, 0.3) !important',
      boxShadow: isFocused
        ? '0 0 0 3px rgba(69, 183, 209, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.05) !important'
        : 'inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(0, 0, 0, 0.05) !important',
      color: '#000000 !important',
      fontFamily: '"Montserrat", sans-serif !important',
      minHeight: '100px !important',
      padding: '12px 16px !important',
      fontSize: '16px !important',
      resize: 'vertical' as const,
      ...style
    };
    
    return (
      <textarea
        className={cn(
          "flex w-full rounded-xl text-base placeholder:text-gray-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        style={glassStyle}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
