import { clsx } from "clsx"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("animate-pulse rounded-md bg-bg-elevated", className)}
      {...props}
    />
  )
}

export { Skeleton }
