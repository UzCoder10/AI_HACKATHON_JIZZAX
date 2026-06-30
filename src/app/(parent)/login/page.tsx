"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      const redirect = searchParams.get("redirect") ?? "/dashboard";
      router.push(json.data.hasPin ? "/pin" : redirect);
      router.refresh();
    } catch {
      setError("Kirishda xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-ambient-primary p-8 md:p-10 border border-surface-container-low">
        <div className="flex justify-center mb-6">
          <BrandLogo href="/" />
        </div>
        <h1 className="text-2xl font-extrabold text-on-surface mb-1 text-center">Kirish</h1>
        <p className="text-sm text-outline mb-6 text-center font-medium">Ota-ona Command Center</p>

        {error && (
          <p className="text-red-700 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-on-surface block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-surface-variant rounded-xl focus:border-primary focus:outline-none min-h-[48px] font-medium bg-brand-bg focus:bg-white transition-colors"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-on-surface block mb-1.5">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 border-2 border-surface-variant rounded-xl focus:border-primary focus:outline-none min-h-[48px] font-medium bg-brand-bg focus:bg-white transition-colors"
              autoComplete="current-password"
            />
          </div>
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-primary text-on-primary rounded-full font-extrabold hover:bg-primary-hover disabled:opacity-50 min-h-[48px] shadow-btn-primary transition-all"
          >
            {loading ? "..." : "Kirish"}
          </button>
        </div>

        <p className="text-center text-sm text-outline mt-6 font-medium">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="text-primary font-extrabold hover:underline">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-bg text-primary font-bold">
          ...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
