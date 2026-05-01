"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface Props {
  variant: "open" | "close";
  onClick: () => void;
  className?: string;
}

export function SidebarToggle({ variant, onClick, className }: Props) {
  const label = variant === "close" ? "Свернуть сайдбар" : "Открыть сайдбар";
  const Icon = variant === "close" ? PanelLeftClose : PanelLeft;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-sidebar-hover hover:text-foreground",
        className
      )}
    >
      <Icon className="h-[17px] w-[17px]" />
    </button>
  );
}
