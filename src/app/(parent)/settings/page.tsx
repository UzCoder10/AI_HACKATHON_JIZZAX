"use client";

import { useEffect, useState } from "react";
import { ParentShell } from "@/components/parent/ParentShell";
import { useParentSession } from "@/lib/parent/ParentProvider";

const inputClass =
  "w-full px-4 py-3 border-2 border-surface-variant rounded-xl focus:border-primary focus:outline-none min-h-[44px] font-medium bg-brand-bg focus:bg-white";

export default function SettingsPage() {
  const { user, refresh } = useParentSession();
  const [screenTime, setScreenTime] = useState(60);
  const [contentLevel, setContentLevel] = useState("standard");
  const [newPin, setNewPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setScreenTime(user.settings.screenTimeMinutes);
      setContentLevel(user.settings.contentLevel);
    }
  }, [user?.settings]);

  async function saveSettings() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/parent/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ screenTimeMinutes: screenTime, contentLevel }),
    });
    const json = await res.json();
    setMsg(json.success ? "Sozlamalar saqlandi" : json.error);
    setLoading(false);
    await refresh();
  }

  async function savePin() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/auth/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set",
        pin: user?.hasPin ? currentPin : undefined,
        newPin,
      }),
    });
    const json = await res.json();
    setMsg(json.success ? "PIN saqlandi" : json.error);
    setNewPin("");
    setCurrentPin("");
    setLoading(false);
    await refresh();
  }

  return (
    <ParentShell title="Sozlamalar" subtitle="Ekran vaqti, kontent va PIN himoyasi">
      <div className="space-y-6 max-w-lg">
        <section className="bg-white rounded-2xl border border-surface-container-low p-6 shadow-vibrant-primary space-y-4">
          <h2 className="font-extrabold text-on-surface">Ekran vaqti limiti</h2>
          <input
            type="range"
            min={15}
            max={180}
            step={15}
            value={screenTime}
            onChange={(e) => setScreenTime(parseInt(e.target.value, 10))}
            className="w-full accent-primary"
          />
          <p className="text-center text-3xl font-black text-primary">{screenTime} daqiqa/kun</p>
        </section>

        <section className="bg-white rounded-2xl border border-surface-container-low p-6 shadow-vibrant-secondary space-y-3">
          <h2 className="font-extrabold text-on-surface">Kontent cheklash</h2>
          <div className="flex gap-3">
            {(["standard", "strict"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setContentLevel(level)}
                className={`flex-1 py-3 rounded-full font-extrabold min-h-[44px] text-sm transition-all ${
                  contentLevel === level
                    ? "bg-primary text-on-primary shadow-btn-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                }`}
              >
                {level === "standard" ? "Standart" : "Qattiq"}
              </button>
            ))}
          </div>
          <p className="text-xs text-outline font-medium">
            Qattiq rejimda qo&apos;shimcha xavfsizlik filtrlari qo&apos;llanadi
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-surface-container-low p-6 shadow-vibrant-primary space-y-3">
          <h2 className="font-extrabold text-on-surface">PIN himoyasi</h2>
          {user?.hasPin && (
            <input
              type="password"
              inputMode="numeric"
              placeholder="Joriy PIN"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
          )}
          <input
            type="password"
            inputMode="numeric"
            placeholder="Yangi PIN (4-6 raqam)"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
          />
          <button
            type="button"
            onClick={savePin}
            disabled={loading || newPin.length < 4}
            className="w-full py-3 bg-on-surface text-white rounded-full font-extrabold min-h-[44px] text-sm hover:opacity-90 disabled:opacity-50"
          >
            PIN saqlash
          </button>
        </section>

        {msg && (
          <p className="text-sm text-center text-primary font-extrabold bg-primary-fixed/30 py-3 rounded-xl">
            {msg}
          </p>
        )}

        <button
          type="button"
          onClick={saveSettings}
          disabled={loading}
          className="w-full py-3.5 bg-primary text-on-primary rounded-full font-extrabold min-h-[48px] shadow-btn-primary hover:bg-primary-hover"
        >
          Sozlamalarni saqlash
        </button>
      </div>
    </ParentShell>
  );
}
