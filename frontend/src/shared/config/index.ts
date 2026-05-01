export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME ?? "openai/gpt-oss-120b:free";

export const SUGGESTION_PROMPTS = [
  {
    icon: "Sparkles" as const,
    title: "Объясни концепцию",
    subtitle: "квантовых вычислений на пальцах",
  },
  {
    icon: "Code2" as const,
    title: "Напиши код",
    subtitle: "REST API на FastAPI с авторизацией",
  },
  {
    icon: "PenLine" as const,
    title: "Помоги написать",
    subtitle: "холодное письмо инвестору",
  },
  {
    icon: "Lightbulb" as const,
    title: "Подкинь идей",
    subtitle: "для запуска SaaS в 2026",
  },
];
