"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

const inputClass =
  "w-full px-4 py-3 border-2 border-surface-variant rounded-xl focus:border-primary focus:outline-none min-h-[48px] font-medium bg-brand-bg focus:bg-white transition-colors";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ro'yxatdan o'tishda xatolik");
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
        <h1 className="text-2xl font-extrabold text-on-surface mb-1 text-center">
          Ro&apos;yxatdan o&apos;tish
        </h1>
        <p className="text-sm text-outline mb-6 text-center font-medium">Ota-ona Command Center</p>

        {error && (
          <p className="text-red-700 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-on-surface block mb-1.5">Ismingiz</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-bold text-on-surface block mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-bold text-on-surface block mb-1.5">Parol (min 8)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3.5 bg-primary text-on-primary rounded-full font-extrabold hover:bg-primary-hover disabled:opacity-50 min-h-[48px] shadow-btn-primary transition-all"
          >
            {loading ? "..." : "Ro'yxatdan o'tish"}
          </button>
        </div>

        <p className="text-center text-sm text-outline mt-6 font-medium">
          Hisobingiz bormi?{" "}
          <Link href="/login" className="text-primary font-extrabold hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
