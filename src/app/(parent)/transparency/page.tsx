"use client";

import { ParentShell } from "@/components/parent/ParentShell";

const CAN_SEE = [
  "AI yordamchi bilan ta'limiy suhbat",
  "Buyuk Siymolar bilan tarixiy shaxslar suhbati",
  "Kunlik kayfiyat emoji tanlash",
  "Kunlik mashg'ulot kartasi",
  "Yulduzcha va daraja (o'yinlashtirilgan mukofot)",
  "Xavfsiz, yoshga mos javoblar (filtrlangan)",
];

const CANNOT_SEE = [
  "Kattalarga oid kontent",
  "Shaxsiy ma'lumot so'rash",
  "Tibbiy/psixologik tashxis",
  "Companion/do'st sifatida hissiy bog'lanish",
  "Filtrlanmagan AI javoblari",
];

const PARENT_SEES = [
  "Umumlashtirilgan haftalik insight (kayfiyat tendensiyasi)",
  "Qiziqish mavzulari (masalan: astronomiya)",
  "Faollik vaqti statistikasi",
  "Xavfsizlik ogohlantirishlari (xulosa, matn emas)",
  "Kayfiyat signallari (tashxis emas)",
];

const PARENT_NOT_SEES = [
  "Bolaning so'zma-so'z suhbat matnlari",
  "Nozik/muammoli xabarlar to'liq matni",
  "Klinik tashxis yoki tibbiy xulosa",
];

export default function TransparencyPage() {
  return (
    <ParentShell
      title="Shaffoflik"
      subtitle="Farzandingiz va siz nimalarni ko'rasiz — aniq va ochiq"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-tertiary-fixed/25 border border-tertiary-fixed-dim/40 rounded-2xl p-6 shadow-vibrant-tertiary">
          <h2 className="font-extrabold text-tertiary mb-3">✅ Bola ko&apos;ra oladi</h2>
          <ul className="space-y-2">
            {CAN_SEE.map((item) => (
              <li key={item} className="text-sm text-on-surface font-medium">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-vibrant-red">
          <h2 className="font-extrabold text-red-800 mb-3">🚫 Bola ko&apos;ra olmaydi</h2>
          <ul className="space-y-2">
            {CANNOT_SEE.map((item) => (
              <li key={item} className="text-sm text-red-900 font-medium">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-primary-fixed/30 border border-primary/20 rounded-2xl p-6 shadow-ambient-primary">
          <h2 className="font-extrabold text-primary mb-3">👁️ Ota-ona ko&apos;radi</h2>
          <ul className="space-y-2">
            {PARENT_SEES.map((item) => (
              <li key={item} className="text-sm text-on-surface font-medium">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-surface-container border border-surface-variant rounded-2xl p-6">
          <h2 className="font-extrabold text-on-surface mb-3">🔒 Ota-ona ko&apos;rmaydi</h2>
          <ul className="space-y-2">
            {PARENT_NOT_SEES.map((item) => (
              <li key={item} className="text-sm text-on-surface-variant font-medium">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ParentShell>
  );
}
