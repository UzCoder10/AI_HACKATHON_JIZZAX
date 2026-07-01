"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { PARENT_ROUTES } from "@/lib/parent/routes";
import { MaterialIcon } from "./MaterialIcon";
import { useReducedMotion } from "./useReducedMotion";

const INTERESTS = ["Matematika", "Rasm chizish", "Chet tillari", "Mantiq", "Kosmos", "Tabiat"];
const AGES = [7, 8, 9, 10, 11, 12];

const inputClass =
  "w-full rounded-xl border border-[#c7c4d8] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] min-h-[48px]";

type ChildDraft = {
  name: string;
  age: string;
  interests: string[];
};

function StepIndicator({ step }: { step: number }) {
  const labels = ["Ota-ona ma'lumotlari", "Bola qo'shish", "Yakunlash"];

  return (
    <nav className="flex items-center justify-center gap-2 md:gap-8">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex items-center gap-2 md:gap-8">
            {i > 0 && <div className="hidden h-px w-8 bg-[#c7c4d8] md:block md:w-16" />}
            <div
              className={`flex items-center gap-2 text-sm font-semibold ${
                done ? "text-[#005523]" : active ? "text-[#4f46e5]" : "text-[#777587]"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  done
                    ? "border-[#4ae176] bg-[#4ae176] text-[#005523]"
                    : active
                      ? "border-[#4f46e5] bg-[#c3c0ff] text-[#3525cd]"
                      : "border-[#c7c4d8] text-[#777587]"
                }`}
              >
                {done ? <MaterialIcon name="check" size="sm" /> : n}
              </span>
              <span className="hidden md:inline">{label}</span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function RegisterOnboarding() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [child, setChild] = useState<ChildDraft>({ name: "", age: "8", interests: [] });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [childAdded, setChildAdded] = useState(false);

  function toggleInterest(interest: string) {
    setChild((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  }

  async function finishRegistration() {
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

      if (child.name.trim()) {
        const childRes = await fetch("/api/parent/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: child.name, age: child.age, language: "uz" }),
        });
        const childJson = await childRes.json();
        if (childJson.success) setChildAdded(true);
      }

      setStep(3);
    } catch {
      setError("Ro'yxatdan o'tishda xatolik");
    } finally {
      setLoading(false);
    }
  }

  function handleStep1Next() {
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Ism, email va parol (min 8) to'ldirilishi shart");
      return;
    }
    setError(null);
    setStep(2);
  }

  return (
    <div className="parent-nurture relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[5%] -top-[10%] h-[40%] w-[40%] rounded-full bg-[#dee8ff] opacity-40 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[5%] h-[40%] w-[40%] rounded-full bg-[#ffdbca] opacity-30 blur-[100px]" />
      </div>

      <main className="flex w-full max-w-[800px] flex-col gap-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-[#111c2d] md:text-[32px] md:leading-10">
            Xush kelibsiz! Farzandingiz kelajagi uchun ilk qadam.
          </h1>
          <p className="mx-auto max-w-[600px] text-base text-[#464555]">
            {BRAND.name} orqali farzandingizning bilim olish jarayonini boshqarishni boshlang.
          </p>
        </header>

        <StepIndicator step={step} />

        <div className="relative rounded-3xl border border-white/30 bg-white/80 p-6 shadow-[0_4px_20px_rgba(30,41,59,0.05)] backdrop-blur-md md:p-10">
          {error && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          {step === 1 && (
            <div className={reduced ? "" : "nurture-fade-in"}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold md:text-2xl">Shaxsiy ma&apos;lumotlar</h2>
                  <div>
                    <label className="mb-1 ml-1 block text-sm font-semibold text-[#464555]">
                      To&apos;liq ism-sharifingiz
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masalan: Aziz Rahimov"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 ml-1 block text-sm font-semibold text-[#464555]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="siz@example.uz"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <label className="mb-1 ml-1 block text-sm font-semibold text-[#464555]">
                      Parol yarating (min 8)
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-[38px] text-[#777587]"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Parolni ko'rsatish"
                    >
                      <MaterialIcon name={showPassword ? "visibility_off" : "visibility"} size="sm" />
                    </button>
                  </div>
                </div>
                <div className="hidden flex-col items-center justify-center rounded-xl bg-[#f0f3ff] p-6 md:flex">
                  <div className="mb-4 flex h-48 w-full items-center justify-center rounded-lg bg-gradient-to-br from-[#dee8ff] to-[#e2dfff]">
                    <MaterialIcon name="family_restroom" size="xl" className="text-[#3525cd]/30" />
                  </div>
                  <p className="px-2 text-center text-xs text-[#777587]">
                    Ma&apos;lumotlaringiz xavfsizligi biz uchun ustuvor vazifa. {BRAND.name} SSL bilan himoyalangan.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="flex items-center gap-2 rounded-xl bg-[#4f46e5] px-8 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                >
                  Davom etish
                  <MaterialIcon name="arrow_forward" size="sm" className="text-white" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={reduced ? "" : "nurture-fade-in"}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold md:text-2xl">Farzandingiz haqida</h2>
                <span className="rounded-full bg-[#ffdbca] px-3 py-1 text-sm font-semibold text-[#341100]">
                  Bola #1
                </span>
              </div>
              <div className="space-y-4 rounded-xl border border-[#c7c4d8]/30 bg-[#f0f3ff] p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 ml-1 block text-sm font-semibold text-[#464555]">Ismi</label>
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => setChild({ ...child, name: e.target.value })}
                      placeholder="Masalan: Laylo"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 ml-1 block text-sm font-semibold text-[#464555]">Yoshi</label>
                    <select
                      value={child.age}
                      onChange={(e) => setChild({ ...child, age: e.target.value })}
                      className={inputClass}
                    >
                      {AGES.map((a) => (
                        <option key={a} value={String(a)}>
                          {a} yosh
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 ml-1 block text-sm font-semibold text-[#464555]">Qiziqishlari</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => {
                      const active = child.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                            active
                              ? "border-[#4f46e5] bg-[#4f46e5] text-white"
                              : "border-[#c7c4d8] hover:bg-[#dee8ff]"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#777587]">Bola ma&apos;lumotini keyinroq ham qo&apos;shishingiz mumkin.</p>
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 rounded-xl px-4 py-3 text-sm font-semibold text-[#464555] hover:bg-[#dee8ff]"
                >
                  <MaterialIcon name="arrow_back" size="sm" />
                  Orqaga
                </button>
                <button
                  type="button"
                  onClick={finishRegistration}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#4f46e5] px-8 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? "..." : "Yakunlash"}
                  <MaterialIcon name="arrow_forward" size="sm" className="text-white" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={`space-y-8 py-8 text-center ${reduced ? "" : "nurture-fade-in"}`}>
              <div className="relative mx-auto h-32 w-32">
                {!reduced && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#6bff8f] opacity-20" />
                )}
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#4ae176]">
                  <MaterialIcon name="check_circle" size="lg" className="text-[#005523] !text-[64px]" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold md:text-2xl">Ajoyib! Hamma narsa tayyor.</h2>
                <p className="mx-auto mt-2 max-w-md text-base text-[#464555]">
                  Siz muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz. Endi farzandingiz uchun o&apos;quv dasturini
                  shakllantirishimiz mumkin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  router.push(childAdded ? PARENT_ROUTES.dashboard : PARENT_ROUTES.children);
                  router.refresh();
                }}
                className="rounded-xl bg-[#4f46e5] px-10 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
              >
                {childAdded ? "Asosiy panelga o'tish" : "Bola qo'shish"}
              </button>
              {childAdded && (
                <Link
                  href={PARENT_ROUTES.children}
                  className="block text-sm font-semibold text-[#3525cd] hover:underline"
                >
                  Yana bola qo&apos;shish
                </Link>
              )}
              <div className="mx-auto grid max-w-sm grid-cols-3 gap-4 pt-4">
                {[
                  { icon: "school", label: "Smart Dars" },
                  { icon: "monitoring", label: "Hisobotlar" },
                  { icon: "workspace_premium", label: "Yutuqlar" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#dee8ff]">
                      <MaterialIcon name={icon} className="text-[#3525cd]" />
                    </div>
                    <span className="text-xs text-[#777587]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="flex flex-col items-center justify-between gap-2 px-2 text-xs text-[#777587] sm:flex-row">
          <div className="flex items-center gap-2">
            <MaterialIcon name="help_outline" className="!text-lg" />
            Yordam kerakmi?{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="font-semibold text-[#3525cd] hover:underline">
              {BRAND.supportEmail}
            </a>
          </div>
          <div>{BRAND.footerLegal}</div>
        </footer>

        {step < 3 && (
          <p className="text-center text-sm text-[#777587]">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="font-bold text-[#3525cd] hover:underline">
              Kirish
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
