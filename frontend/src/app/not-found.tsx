import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="font-serif text-6xl">404</h1>
      <p className="text-muted-foreground">Страница не найдена</p>
      <Link
        href="/new"
        className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        На главную
      </Link>
    </div>
  );
}
