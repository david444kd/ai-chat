"use client";

import { useEffect, useRef } from "react";

export function useAutoScroll(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      shouldAutoScroll.current = nearBottom;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(
    () => {
      if (shouldAutoScroll.current && ref.current) {
        ref.current.scrollTo({
          top: ref.current.scrollHeight,
          behavior: "smooth",
        });
      }
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: forwarded deps array is intentional
    deps
  );

  return ref;
}
