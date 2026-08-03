import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export default function PrimaryButton({
  children,
  onClick,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        rounded-xl
        bg-green-500
        px-5
        py-3
        font-semibold
        text-black
        transition-all
        duration-300
        hover:bg-green-400
        active:scale-95
      "
    >
      {children}
    </button>
  );
}