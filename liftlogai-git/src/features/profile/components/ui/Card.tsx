import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../../shared/lib/cn";
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        `
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:border-green-500
        hover:shadow-xl
        hover:shadow-green-500/10
        `,
        className
      )}
    >
      {children}
    </div>
  );
}