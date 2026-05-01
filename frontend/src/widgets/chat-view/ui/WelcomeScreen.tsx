import { Code2, Lightbulb, PenLine, Sparkles } from "lucide-react";
import { SUGGESTION_PROMPTS } from "@/shared/config";

const iconMap = { Sparkles, Code2, PenLine, Lightbulb } as const;
type IconName = keyof typeof iconMap;

interface Props {
  onPick: (text: string) => void;
}

export function WelcomeScreen({ onPick }: Props) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-6 py-16">
      <div className="animate-fade-up">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-[var(--shadow-glow)] animate-pulse-glow">
          <Sparkles className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-center font-serif text-[44px] leading-tight tracking-tight">
          Чем могу <em className="text-gradient">помочь</em> сегодня?
        </h1>
        <p className="mt-3 text-center text-[14px] text-muted-foreground">
          Задайте вопрос или выберите идею ниже
        </p>
      </div>

      <div
        className="mt-12 grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
        style={{
          animation: "fade-in-up 0.6s 0.1s var(--transition-smooth) both",
        }}
      >
        {SUGGESTION_PROMPTS.map((p) => {
          const Icon = iconMap[p.icon as IconName];
          return (
            <button
              type="button"
              key={p.title}
              onClick={() => onPick(`${p.title}: ${p.subtitle}`)}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface-elevated/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-elevated hover:shadow-[var(--shadow-md)]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary transition group-hover:bg-primary/10">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium">{p.title}</div>
                <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                  {p.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
