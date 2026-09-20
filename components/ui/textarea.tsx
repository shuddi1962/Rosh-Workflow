import * as React from "react"
import { clsx } from "clsx"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={clsx(
          "flex min-h-[80px] w-full rounded-lg border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary ring-offset-bg-void placeholder:text-text-muted focus-visible:outline-none focus-visible:border-accent-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
