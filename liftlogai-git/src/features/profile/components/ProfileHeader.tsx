import { FiAward } from "react-icons/fi";

import Badge from "../../../shared/components/ui/Badge";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";

interface Props {
  name: string;
  version?: string;
  className?: string;
}

export default function ProfileHeader({
  name,
  version = "1.0.0",
  className,
}: Props) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex flex-col items-center px-6 py-8 text-center">
        {/* Avatar */}
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full",
            "bg-gradient-to-br from-green-500 to-emerald-500",
            "text-3xl font-bold text-black shadow-lg"
          )}
        >
          {initials}
        </div>

        {/* Name */}
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {name}
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          LiftLog AI User
        </p>

        {/* Version */}
        <div className="mt-6">
          <Badge variant="success">
            <span className="flex items-center gap-2">
              <FiAward size={14} />
              Version {version}
            </span>
          </Badge>
        </div>
      </div>
    </Card>
  );
}