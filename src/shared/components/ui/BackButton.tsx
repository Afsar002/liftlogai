import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/cn";

interface Props {
  /** Explicit destination; defaults to navigate(-1). */
  to?: string;
  label?: string;
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Standardized back button used by every non-root page (via PageHeader).
 * Pill-shaped, neutral, with a comfortable touch target.
 */
export default function BackButton({
  to,
  label,
  ariaLabel,
  onClick,
  className,
}: Props) {
  const navigate = useNavigate();

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
    navigate(-1);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? (label ?? "Go back")}
      className={cn(
        "-ml-2 inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm font-medium",
        "text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900",
        "dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        className
      )}
    >
      <FiArrowLeft size={18} aria-hidden="true" />
      {label && <span>{label}</span>}
    </button>
  );
}
