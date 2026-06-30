"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function PinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("PIN tekshirishda xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-sm bg-white rounded-[32px] shadow-ambient-primary p-8 md:p-10 border border-surface-container-low text-center">
        <div className="flex justify-center mb-4">
          <BrandLogo href="/" size="sm" showText={false} />
        </div>
        <span className="text-4xl">🔒</span>
        <h1 className="text-xl font-extrabold text-on-surface mt-3">PIN kiriting</h1>
        <p className="text-sm text-outline mt-1 mb-6 font-medium">Command Center ga kirish uchun</p>

        {error && (
          <p className="text-red-700 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
            {error}
          </p>
        )}

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          className="w-full text-center text-2xl tracking-[0.5em] px-4 py-4 border-2 border-surface-variant rounded-xl focus:border-primary focus:outline-none mb-4 font-bold bg-brand-bg focus:bg-white"
          placeholder="••••"
          aria-label="PIN"
        />

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || pin.length < 4}
          className="w-full py-3.5 bg-primary text-on-primary rounded-full font-extrabold hover:bg-primary-hover disabled:opacity-50 min-h-[48px] shadow-btn-primary transition-all"
        >
          {loading ? "..." : "Kirish"}
        </button>
      </div>
    </div>
  );
}
