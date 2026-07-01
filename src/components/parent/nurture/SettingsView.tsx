"use client";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
};

export function NurtureToggle({ checked, onChange, label }: Props) {
  return (
    <label className="flex cursor-pointer items-center justify-between group">
      <span className="text-base text-[#464555]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#fd761a]" : "bg-[#c7c4d8]"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </label>
  );
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTimeLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} daqiqa`;
  if (m === 0) return `${h} soat`;
  return `${h} soat ${m} daqiqa`;
}

const inputClass =
  "w-full rounded-xl border-none bg-[#f0f3ff] px-4 py-3 text-base font-medium text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 min-h-[44px]";

type SettingsViewProps = {
  screenTime: number;
  setScreenTime: (v: number) => void;
  contentLevel: string;
  setContentLevel: (v: string) => void;
  newPin: string;
  setNewPin: (v: string) => void;
  currentPin: string;
  setCurrentPin: (v: string) => void;
  hasPin: boolean;
  weeklyReports: boolean;
  setWeeklyReports: (v: boolean) => void;
  activityAlerts: boolean;
  setActivityAlerts: (v: boolean) => void;
  newTasks: boolean;
  setNewTasks: (v: boolean) => void;
  msg: string | null;
  loading: boolean;
  onSaveSettings: () => void;
  onSavePin: () => void;
  onLogout: () => void;
};

export function SettingsView({
  screenTime,
  setScreenTime,
  contentLevel,
  setContentLevel,
  newPin,
  setNewPin,
  currentPin,
  setCurrentPin,
  hasPin,
  weeklyReports,
  setWeeklyReports,
  activityAlerts,
  setActivityAlerts,
  newTasks,
  setNewTasks,
  msg,
  loading,
  onSaveSettings,
  onSavePin,
  onLogout,
}: SettingsViewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="nurture-card rounded-3xl border border-[#c7c4d8]/10 bg-white p-6 md:p-8 lg:col-span-8">
          <div className="space-y-8">
            <div className="rounded-2xl bg-[#f0f3ff] p-4">
              <div className="mb-4 flex flex-col items-center justify-center rounded-2xl border border-[#c7c4d8]/20 bg-white/50 py-8 shadow-inner">
                <div className="mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined animate-pulse text-[#fd761a]">schedule</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#777587]">Kunlik limit</span>
                </div>
                <div className="mb-4 text-5xl font-bold leading-none text-[#3525cd]">{formatTime(screenTime)}</div>
                <div className="mb-6 rounded-full bg-[#ffdbca] px-3 py-1 text-xs font-bold text-[#341100]">FAOL</div>
                <div className="w-full max-w-md px-4">
                  <input
                    type="range"
                    min={15}
                    max={300}
                    step={15}
                    value={screenTime}
                    onChange={(e) => setScreenTime(parseInt(e.target.value, 10))}
                    className="nurture-slider h-3 w-full cursor-pointer appearance-none rounded-full bg-[#dee8ff] accent-[#fd761a]"
                  />
                  <div className="mt-4 flex justify-between text-xs font-bold text-[#777587]">
                    <span>15 daqiqa</span>
                    <span className="text-[#fd761a]">{formatTimeLabel(screenTime)}</span>
                    <span>5 soat</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="group cursor-pointer rounded-[20px] border border-[#c7c4d8]/30 bg-white p-6 transition-all hover:border-[#3525cd] hover:shadow-lg hover:shadow-[#3525cd]/10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e2dfff] transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined filled text-[32px] text-[#3525cd]">bedtime</span>
                  </div>
                  <span className="material-symbols-outlined text-[#777587] opacity-0 transition-opacity group-hover:opacity-100">
                    arrow_forward_ios
                  </span>
                </div>
                <p className="mb-1 text-xl font-bold">Uyqu vaqti</p>
                <p className="text-base text-[#464555]">21:00 dan keyin qurilmani avtomatik bloklash</p>
              </div>
              <div className="group cursor-pointer rounded-[20px] border border-[#c7c4d8]/30 bg-white p-6 transition-all hover:border-[#005523] hover:shadow-lg hover:shadow-[#005523]/10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6bff8f] transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined filled text-[32px] text-[#005523]">school</span>
                  </div>
                  <span className="material-symbols-outlined text-[#777587] opacity-0 transition-opacity group-hover:opacity-100">
                    arrow_forward_ios
                  </span>
                </div>
                <p className="mb-1 text-xl font-bold">Dars vaqti</p>
                <p className="text-base text-[#464555]">08:00 - 14:00 oralig&apos;ida faqat ta&apos;lim ilovalari</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Kontent cheklash</h3>
              <div className="flex gap-3">
                {(["standard", "strict"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setContentLevel(level)}
                    className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all min-h-[44px] ${
                      contentLevel === level
                        ? "bg-[#3525cd] text-white shadow-lg shadow-[#3525cd]/20"
                        : "bg-[#e7eeff] text-[#464555] hover:bg-[#dee8ff]"
                    }`}
                  >
                    {level === "standard" ? "Standart" : "Qattiq"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#777587]">
                Qattiq rejimda qo&apos;shimcha xavfsizlik filtrlari qo&apos;llanadi
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <div className="nurture-card rounded-3xl border border-[#c7c4d8]/10 bg-white p-6 md:p-8">
            <h3 className="mb-4 text-sm font-bold text-[#111c2d]">Bildirishnomalar</h3>
            <div className="space-y-4">
              <NurtureToggle label="Haftalik hisobotlar" checked={weeklyReports} onChange={setWeeklyReports} />
              <hr className="border-[#c7c4d8]/20" />
              <NurtureToggle label="Faollik signallari" checked={activityAlerts} onChange={setActivityAlerts} />
              <hr className="border-[#c7c4d8]/20" />
              <NurtureToggle label="Yangi topshiriqlar" checked={newTasks} onChange={setNewTasks} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-[#3525cd] p-6 text-white shadow-xl shadow-[#3525cd]/30 md:p-8">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider opacity-80">Premium Plan</h3>
            <p className="mb-4 text-xl font-bold">Oila paketi</p>
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                3 tagacha bolalar profili
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Sun&apos;iy intellekt tahlillari
              </div>
            </div>
            <a
              href="/dashboard/subscription"
              className="block w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-[#3525cd] transition-colors hover:bg-[#e2dfff]"
            >
              Hisob-kitob tarixi
            </a>
          </div>
        </aside>

        <section className="nurture-card rounded-3xl border border-[#c7c4d8]/10 bg-white p-6 md:col-span-7 md:p-8 lg:col-span-7">
          <h3 className="mb-6 text-xl font-bold md:text-2xl">PIN himoyasi</h3>
          <div className="space-y-4 max-w-md">
            {hasPin && (
              <div>
                <label className="mb-1 block text-sm font-bold text-[#777587]">Joriy PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  className={inputClass}
                  placeholder="****"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-bold text-[#777587]">Yangi PIN (4-6 raqam)</label>
              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                className={inputClass}
                placeholder="****"
              />
            </div>
            <button
              type="button"
              onClick={onSavePin}
              disabled={loading || newPin.length < 4}
              className="rounded-xl bg-[#111c2d] px-8 py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              PIN saqlash
            </button>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-3xl bg-[#007030] p-6 text-white md:col-span-5 md:p-8 lg:col-span-5">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <span className="material-symbols-outlined filled text-[32px]">security</span>
            </div>
            <h3 className="mb-2 text-xl font-bold md:text-2xl">Xavfsizlik va Maxfiylik</h3>
            <p className="mb-4 text-base leading-relaxed opacity-90">
              Biz farzandingizning ma&apos;lumotlarini 256-bitli shifrlash tizimi orqali himoya qilamiz. Hech qachon
              shaxsiy ma&apos;lumotlarni uchinchi shaxslarga sotmaymiz.
            </p>
          </div>
          <div className="space-y-2">
            <a
              href="/transparency"
              className="flex items-center justify-between rounded-xl bg-white/10 p-4 transition-colors hover:bg-white/20"
            >
              <span className="text-sm font-semibold">Shaffoflik markazi</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
            <a
              href="/safety"
              className="flex items-center justify-between rounded-xl bg-white/10 p-4 transition-colors hover:bg-white/20"
            >
              <span className="text-sm font-semibold">Xavfsizlik ogohlantirishlari</span>
              <span className="material-symbols-outlined">shield</span>
            </a>
          </div>
        </section>
      </div>

      {msg && (
        <p className="rounded-xl bg-[#e2dfff]/50 py-3 text-center text-sm font-bold text-[#3525cd]">{msg}</p>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onSaveSettings}
          disabled={loading}
          className="rounded-xl bg-[#3525cd] px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3525cd]/20 transition-all hover:shadow-xl disabled:opacity-50"
        >
          Sozlamalarni saqlash
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-[#ba1a1a] transition-all hover:bg-[#ffdad6]/50"
        >
          <span className="material-symbols-outlined">logout</span>
          Tizimdan chiqish
        </button>
      </div>
    </div>
  );
}
