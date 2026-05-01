"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/icon-button";

interface Props {
  variant: "open" | "close";
  onClick: () => void;
  className?: string;
}

export function SidebarToggle({ variant, onClick, className }: Props) {
  const label = variant === "close" ? "Свернуть сайдбар" : "Открыть сайдбар";
  const Icon = variant === "close" ? PanelLeftClose : PanelLeft;

  return (
    <IconButton
      onClick={onClick}
      aria-label={label}
      className={cn("hover:bg-sidebar-hover", className)}
    >
      <Icon className="h-[17px] w-[17px]" />
    </IconButton>
  );
}
