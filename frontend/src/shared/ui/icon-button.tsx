import * as React from "react";
import { cn } from "@/shared/lib/cn";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", type = "button", ...props }, ref) => (
    <button
      type={type}
      ref={ref}
      className={cn(
        "grid place-items-center rounded-md text-muted-foreground transition hover:text-foreground",
        size === "sm" && "h-7 w-7",
        size === "md" && "h-8 w-8",
        className
      )}
      {...props}
    />
  )
);
IconButton.displayName = "IconButton";

export { IconButton };
