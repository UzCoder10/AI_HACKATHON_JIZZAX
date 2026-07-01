"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useCountUp(target: number, duration = 1200, suffix = ""): string {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }

    let startTime: number | null = null;
    let frame: number;

    const step = (now: number) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
      setValue(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  return `${value}${suffix}`;
}
