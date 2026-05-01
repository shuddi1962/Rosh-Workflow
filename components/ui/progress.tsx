import * as React from "react"
import { clsx } from "clsx"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number; max?: number }
>(({ className, value = 0, max = 100, ...props }, ref) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div
      ref={ref}
      className={clsx(
        "relative h-2 w-full overflow-hidden rounded-full bg-bg-elevated",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-accent-primary to-accent-primary-glow transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
