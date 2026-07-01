import { describe, it, expect } from "vitest";
import {
  parseYoutubeId,
  buildNocookieEmbedUrl,
  formatDuration,
  isValidYoutubeId,
  parseIso8601Duration,
} from "@/lib/youtube";

describe("parseYoutubeId", () => {
  it("11 belgili ID ni qabul qiladi", () => {
    expect(parseYoutubeId("Qd6nLM2JlI8")).toBe("Qd6nLM2JlI8");
  });

  it("watch URL dan ajratadi", () => {
    expect(parseYoutubeId("https://www.youtube.com/watch?v=Qd6nLM2JlI8")).toBe("Qd6nLM2JlI8");
  });

  it("youtu.be dan ajratadi", () => {
    expect(parseYoutubeId("https://youtu.be/Qd6nLM2JlI8")).toBe("Qd6nLM2JlI8");
  });

  it("noto'g'ri link null", () => {
    expect(parseYoutubeId("not-a-link")).toBeNull();
  });
});

describe("buildNocookieEmbedUrl", () => {
  it("youtube-nocookie va xavfsiz parametrlar", () => {
    const url = buildNocookieEmbedUrl("Qd6nLM2JlI8", { origin: "https://app.example.com" });
    expect(url).toContain("youtube-nocookie.com/embed/Qd6nLM2JlI8");
    expect(url).toContain("rel=0");
    expect(url).toContain("modestbranding=1");
    expect(url).toContain("iv_load_policy=3");
    expect(url).toContain("fs=0");
    expect(url).toContain("disablekb=1");
    expect(url).toContain("enablejsapi=1");
  });
});

describe("formatDuration", () => {
  it("mm:ss format", () => {
    expect(formatDuration(285)).toBe("4:45");
  });
});

describe("isValidYoutubeId", () => {
  it("valid ID", () => {
    expect(isValidYoutubeId("Qd6nLM2JlI8")).toBe(true);
  });
});

describe("parseIso8601Duration", () => {
  it("PT4M45S", () => {
    expect(parseIso8601Duration("PT4M45S")).toBe(285);
  });

  it("PT1H2M3S", () => {
    expect(parseIso8601Duration("PT1H2M3S")).toBe(3723);
  });
});
