import * as React from "react"
import { clsx } from "clsx"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent-primary text-text-on-accent hover:bg-accent-primary/90",
        destructive: "bg-accent-red text-text-on-accent hover:bg-accent-red/90",
        outline: "border border-border-default bg-transparent hover:bg-bg-elevated hover:text-text-primary",
        secondary: "bg-bg-elevated text-text-secondary hover:bg-bg-overlay",
        ghost: "hover:bg-bg-elevated hover:text-text-primary",
        link: "text-accent-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
    return (
      <button
        className={clsx(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
