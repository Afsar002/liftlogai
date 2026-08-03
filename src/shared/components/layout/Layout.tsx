import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import AnimatedPage from "../motion/AnimatedPage";
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
        "bg-base-50 text-zinc-900",
        "dark:bg-base-950 dark:text-zinc-100",
        className
      )}
    >
      <main
        className="
          mx-auto
          w-full
          max-w-lg
          px-6
          py-8
          pb-32

          sm:max-w-xl
          sm:px-8

          md:max-w-3xl
          md:px-10

          lg:max-w-5xl
          xl:max-w-7xl
        "
      >
        <AnimatedPage orchestrate staggerChildren>{children}</AnimatedPage>
      </main>

      <BottomNav />
    </div>
  );
}
