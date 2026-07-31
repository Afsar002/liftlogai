import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { cn } from "../../lib/cn";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({
  children,
  className,
}: LayoutProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen transition-colors duration-150",
        "bg-zinc-50 text-zinc-900",
        "dark:bg-zinc-950 dark:text-zinc-100",
        className
      )}
    >
      <main
        className="
          mx-auto
          w-full
          max-w-lg
          px-4
          py-6
          pb-28

          sm:max-w-xl
          sm:px-6

          md:max-w-3xl
          md:px-8

          lg:max-w-5xl
          xl:max-w-7xl
        "
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}