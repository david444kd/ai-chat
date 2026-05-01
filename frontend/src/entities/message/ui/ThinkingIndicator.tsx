import { Sparkles } from "lucide-react";

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
      style={{ animation: `dot-pulse 1.2s ${delay} ease-in-out infinite` }}
    />
  );
}

export function ThinkingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-primary shadow-[var(--shadow-glow)]">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-1 pt-2.5">
        <Dot delay="0s" />
        <Dot delay="0.15s" />
        <Dot delay="0.3s" />
      </div>
    </div>
  );
}
