interface GreetingCardProps {
  name: string;
}

export default function GreetingCard({ name }: GreetingCardProps) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {greeting} 👋
      </p>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        {name}
      </h1>
    </div>
  );
}