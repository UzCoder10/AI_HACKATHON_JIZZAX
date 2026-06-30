"use client";

import { useEffect, useState } from "react";

/** Xavfsiz javobni yozilayotgandek ko'rsatish (client-side streaming effekt) */
export function useStreamingText(fullText: string, active: boolean, speedMs = 18) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayed(fullText);
      return;
    }

    setDisplayed("");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setDisplayed(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(timer);
    }, speedMs);

    return () => clearInterval(timer);
  }, [fullText, active, speedMs]);

  const isStreaming = active && displayed.length < fullText.length;

  return { displayed, isStreaming };
}

export async function* streamTextLocally(text: string, chunkSize = 2, delayMs = 20) {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(0, i + chunkSize);
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
