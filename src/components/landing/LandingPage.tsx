import Link from "next/link";
import { VoiceWave } from "./VoiceWave";
import { DemoForm } from "./DemoForm";
import { PARENT_ROUTES } from "@/lib/parent/routes";
import { BRAND } from "@/lib/brand";

const ACTIVITY_HEIGHTS = [46, 62, 40, 78, 58, 92, 70];

function LandingLogo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-[11px]">
      <div className="w-[38px] h-[38px] rounded-[11px] bg-[#3E41DE] flex items-center justify-center gap-[2.5px]">
        <span className="block w-[3px] h-[9px] rounded-[3px] bg-[#FF8C42]" />
        <span className="block w-[3px] h-[17px] rounded-[3px] bg-white" />
        <span className="block w-[3px] h-[12px] rounded-[3px] bg-[#FFBE3D]" />
      </div>
      <span
        className={`landing-font-display font-bold text-[21px] tracking-tight ${light ? "text-white" : "text-[#16162A]"}`}
      >
        {BRAND.name}
      </span>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="flex justify-center relative">
      <div className="absolute w-[330px] h-[330px] rounded-full bg-[radial-gradient(circle,#E9E5FF_0%,rgba(233,229,255,0)_70%)] top-[60px]" />
      <div className="absolute w-16 h-16 rounded-[18px] bg-[#FF8C42] right-1.5 top-[30px] lp-animate-float-fast shadow-[0_14px_30px_rgba(255,140,66,0.35)] flex items-center justify-center text-white text-[26px]">
        🎙
      </div>
      <div className="relative w-[300px] h-[608px] bg-[#16162A] rounded-[42px] p-[11px] shadow-[0_40px_80px_-20px_rgba(22,22,42,0.45)] lp-animate-float max-w-full">
        <div className="absolute left-1/2 -translate-x-1/2 top-5 w-24 h-6 bg-[#16162A] rounded-[14px] z-[3]" />
        <div className="w-full h-full bg-[#3E41DE] rounded-[32px] overflow-hidden flex flex-col">
          <div className="pt-[38px] px-5 pb-4 flex items-center gap-[11px] text-white">
            <div className="w-10 h-10 rounded-[13px] bg-white/15 flex items-center justify-center text-lg">
              🦉
            </div>
            <div>
              <div className="landing-font-display font-semibold text-[15px]">
                AI mentor bilan suhbat
              </div>
              <div className="text-[11.5px] text-[#A9ABE5]">Ingliz tili · talaffuz</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-[#4ADE80]" />
          </div>
          <div className="flex-1 bg-[#F4F3FF] rounded-t-[26px] px-4 pt-5 pb-0 flex flex-col gap-[13px] overflow-hidden">
            <div className="self-start max-w-[80%] bg-white px-[15px] py-3 rounded-2xl rounded-bl-[5px] shadow-[0_3px_12px_rgba(39,42,140,0.07)]">
              <p className="text-[13.5px] text-[#16162A] leading-snug">
                Salom! Keling mashq qilamiz. <b>&quot;beautiful&quot;</b> deb aytib ko&apos;rasanmi?
              </p>
            </div>
            <div className="self-end max-w-[82%] bg-[#3E41DE] px-[15px] py-3 rounded-2xl rounded-br-[5px]">
              <p className="text-[13.5px] text-white leading-snug mb-2">&quot;Byutiful&quot;</p>
              <VoiceWave count={13} color="rgba(255,255,255,0.9)" maxH={18} gap={3} />
            </div>
            <div className="self-start max-w-[84%] bg-white px-[15px] py-3 rounded-2xl rounded-bl-[5px] shadow-[0_3px_12px_rgba(39,42,140,0.07)]">
              <p className="text-[13.5px] text-[#16162A] leading-snug">
                Deyarli! &quot;ti&quot; emas, <b className="text-[#1B8A6B]">&quot;tih&quot;</b> deb ayt. Yana bir
                bor 👍
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 bg-[#E8FBF4] text-[#0E7A5A] text-[11px] font-bold px-[9px] py-1 rounded-lg">
                +15 XP · talaffuz
              </span>
            </div>
          </div>
          <div className="bg-white px-4 pt-3.5 pb-[22px] flex items-center gap-3">
            <div className="flex-1 h-[42px] bg-[#F4F3FF] rounded-[14px] flex items-center px-3.5">
              <VoiceWave count={20} color="#C3C4EF" maxH={20} gap={3} />
            </div>
            <div className="relative w-12 h-12">
              <span className="absolute inset-0 rounded-full bg-[#FF8C42] lp-animate-pulse-ring" />
              <div className="relative w-12 h-12 rounded-full bg-[#FF8C42] flex items-center justify-center text-white text-xl shadow-[0_8px_18px_rgba(255,140,66,0.4)]">
                🎤
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentDashboardMock() {
  return (
    <div className="bg-white border border-[rgba(22,22,42,0.08)] rounded-[26px] shadow-[0_34px_70px_-24px_rgba(39,42,140,0.28)] overflow-hidden">
      <div className="flex items-center gap-[11px] px-6 py-[18px] border-b border-[rgba(22,22,42,0.07)]">
        <div className="w-[38px] h-[38px] rounded-[11px] bg-gradient-to-br from-[#3E41DE] to-[#7C80F0] flex items-center justify-center text-lg">
          🦊
        </div>
        <div className="flex-1">
          <div className="landing-font-display font-bold text-[15px] text-[#16162A]">
            Dilnoza · 11 yosh
          </div>
          <div className="text-xs text-[#9A9AB0]">So&apos;nggi faollik: bugun, 18:40</div>
        </div>
        <span className="text-xs font-semibold text-[#3E41DE] bg-[#EEEFFB] px-[11px] py-[5px] rounded-lg">
          Bu hafta
        </span>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3 mb-[22px]">
          {[
            { v: "4s 20m", l: "Suhbat vaqti", c: "#16162A" },
            { v: "86%", l: "Talaffuz aniqligi", c: "#3E41DE" },
            { v: "+38", l: "Yangi so'z", c: "#1B8A6B" },
          ].map((s) => (
            <div key={s.l} className="bg-[#FAF8F4] rounded-[14px] p-[15px]">
              <div className="landing-font-display font-extrabold text-2xl leading-none" style={{ color: s.c }}>
                {s.v}
              </div>
              <div className="text-xs text-[#9A9AB0] mt-[5px]">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="landing-font-display font-semibold text-sm text-[#16162A]">Haftalik faollik</div>
          <div className="text-xs text-[#1B8A6B] font-semibold bg-[#E8FBF4] px-[9px] py-1 rounded-[7px]">
            ↑ 24% o&apos;sish
          </div>
        </div>
        <div className="flex items-end gap-2.5 h-24 mb-2">
          {ACTIVITY_HEIGHTS.map((hgt, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md rounded-b-sm"
              style={{
                height: `${hgt}%`,
                background: i === 5 ? "linear-gradient(180deg,#FF8C42,#FFBE3D)" : "#E4E4F3",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-[#B0B0C0] mb-[22px]">
          {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="landing-font-display font-semibold text-sm text-[#16162A] mb-3">
          Asosiy qiziqishlar
        </div>
        <div className="flex flex-col gap-[11px]">
          {[
            { label: "Ingliz tili", pct: 42, color: "#3E41DE" },
            { label: "Buyuk Siymolar · tarix", pct: 33, color: "#FF8C42" },
            { label: "Fan va tabiat", pct: 25, color: "#1B8A6B" },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-[13px] mb-[5px] text-[#42425A]">
                <span>{row.label}</span>
                <span className="text-[#9A9AB0]">{row.pct}%</span>
              </div>
              <div className="h-2 bg-[#F1ECE3] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${row.pct}%`, background: row.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[rgba(250,248,244,0.82)] backdrop-blur-[14px] border-b border-[rgba(22,22,42,0.07)]">
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-6">
          <Link href="/">
            <LandingLogo />
          </Link>
          <div className="hidden lg:flex items-center gap-[30px] text-[14.5px] font-medium text-[#42425A]">
            <a href="#imkoniyatlar" className="hover:text-[#3E41DE] transition-colors">
              Imkoniyatlar
            </a>
            <a href="#qanday" className="hover:text-[#3E41DE] transition-colors">
              Qanday ishlaydi
            </a>
            <a href="#ota-ona" className="hover:text-[#3E41DE] transition-colors">
              Ota-onalarga
            </a>
            <a href="#investor" className="hover:text-[#3E41DE] transition-colors">
              Investorlarga
            </a>
            <a href="#bolalar" className="hover:text-[#3E41DE] transition-colors">
              Bolalar uchun
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={PARENT_ROUTES.login}
              className="text-[14.5px] font-semibold text-[#3E41DE] hover:underline px-1"
            >
              Kirish
            </Link>
            <Link
              href={PARENT_ROUTES.register}
              className="hidden sm:inline text-[14.5px] font-semibold text-[#3E41DE] border border-[#3E41DE]/30 px-4 py-[9px] rounded-[11px] hover:bg-[#EEEFFB] transition-all"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
            <a
              href="#demo"
              className="text-[14.5px] font-semibold bg-[#3E41DE] text-white px-5 py-[11px] rounded-[11px] shadow-[0_6px_18px_rgba(39,42,140,0.22)] hover:brightness-110 transition-all"
            >
              Bepul boshlash
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="max-w-[1180px] mx-auto px-4 md:px-8 pt-12 md:pt-[78px] pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#FFF1E3] border border-[#FFDCBC] text-[#B65A12] font-semibold text-[13px] px-3.5 py-[7px] rounded-full mb-6">
            <span className="w-[7px] h-[7px] rounded-full bg-[#FF8C42]" />
            O&apos;zbek tilida ovozli AI — birinchi marta
          </div>
          <h1 className="landing-font-display font-extrabold text-4xl md:text-[54px] leading-[1.05] tracking-tight mb-[22px] text-balance">
            Farzandingiz har kuni{" "}
            <span className="text-[#3E41DE] relative whitespace-nowrap">
              gaplashib
              <span className="absolute left-0 right-0 bottom-0.5 h-[9px] bg-[#FFBE3D] rounded -z-10" />
            </span>{" "}
            o&apos;rganadi
          </h1>
          <p className="text-lg md:text-[18.5px] leading-relaxed text-[#4A4A63] mb-[34px] max-w-[540px]">
            {BRAND.name} — 7–12 yoshli bolalar uchun ovozli AI hamroh. Ingliz tilini talaffuz bilan
            mashq qiladi, buyuk siymolar bilan suhbatlashadi. Har bola uchun shaxsiy, sabrli va 24/7.
          </p>
          <div className="flex flex-wrap gap-3.5 items-center">
            <Link
              href={PARENT_ROUTES.register}
              className="bg-[#3E41DE] text-white font-semibold text-base px-7 py-[15px] rounded-[13px] shadow-[0_10px_28px_rgba(39,42,140,0.26)] hover:brightness-110 transition-all"
            >
              Bepul boshlash →
            </Link>
            <Link
              href={PARENT_ROUTES.login}
              className="bg-white text-[#16162A] font-semibold text-base px-[26px] py-[15px] rounded-[13px] border border-[rgba(22,22,42,0.12)] hover:border-[#3E41DE] transition-all"
            >
              Hisobim bor — kirish
            </Link>
            <a
              href="#qanday"
              className="bg-white text-[#16162A] font-semibold text-base px-[26px] py-[15px] rounded-[13px] border border-[rgba(22,22,42,0.12)] inline-flex items-center gap-2 hover:border-[#3E41DE] transition-all"
            >
              <span className="w-6 h-6 rounded-full bg-[#FFF1E3] inline-flex items-center justify-center text-[#B65A12] text-[11px]">
                ▶
              </span>
              Qanday ishlaydi
            </a>
          </div>
          <p className="mt-4 text-sm text-[#6B6B80] max-w-[520px]">
            Avval ota-ona sifatida ro&apos;yxatdan o&apos;ting, bolangizni qo&apos;shing — keyin bola rejimiga o&apos;ting.
          </p>
          <div className="flex items-center gap-3.5 mt-[34px] text-[#6B6B80] text-sm font-medium">
            <div className="flex">
              {[
                { bg: "#3E41DE", l: "A" },
                { bg: "#FF8C42", l: "D" },
                { bg: "#1B8A6B", l: "N" },
              ].map((a, i) => (
                <span
                  key={a.l}
                  className="w-[34px] h-[34px] rounded-full border-[2.5px] border-[#FAF8F4] inline-flex items-center justify-center text-white text-xs font-semibold"
                  style={{ background: a.bg, marginLeft: i ? -11 : 0 }}
                >
                  {a.l}
                </span>
              ))}
            </div>
            Erta kirish ochiq — birinchi oilalar qatoriga qo&apos;shiling
          </div>
        </div>
        <PhoneMockup />
      </header>

      {/* PROBLEM / SOLUTION */}
      <section className="bg-white border-t border-[rgba(22,22,42,0.06)]">
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center max-w-[680px] mx-auto mb-14">
            <div className="font-bold text-[13px] tracking-[0.12em] uppercase text-[#FF8C42] mb-3.5">
              Muammo va yechim
            </div>
            <h2 className="landing-font-display font-bold text-3xl md:text-[38px] leading-tight tracking-tight">
              Repetitor qimmat. <span className="text-[#9A9AB0]">E&apos;tibor yetishmaydi.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FAF8F4] border border-[rgba(22,22,42,0.07)] rounded-[22px] p-8 md:p-[34px]">
              <div className="landing-font-display font-semibold text-[13px] text-[#C0392B] mb-[18px] flex items-center gap-2">
                <span className="w-[9px] h-[9px] rounded-full bg-[#E0746A]" />
                BUGUNGI HOLAT
              </div>
              <ul className="space-y-[18px] text-base leading-relaxed text-[#42425A]">
                {[
                  "Repetitor oyiga 500 000 – 1 500 000 so'm, lekin guruhda 1:1 e'tibor deyarli yo'q.",
                  "Haftada atigi 2–3 marta dars. Qolgan kunlar bola yolg'iz, mashq qilmaydi.",
                  "Ovozli, jonli muloqot yo'q — bola gapirishdan uyaladi, talaffuz qoqsoq qoladi.",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-[#C0392B] font-bold text-lg shrink-0">—</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#3E41DE] rounded-[22px] p-8 md:p-[34px] text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[rgba(255,140,66,0.18)]" />
              <div className="landing-font-display font-semibold text-[13px] text-[#FFBE3D] mb-[18px] flex items-center gap-2 relative">
                <span className="w-[9px] h-[9px] rounded-full bg-[#FFBE3D]" />
                SMART EDU UZ BILAN
              </div>
              <ul className="space-y-[18px] text-base leading-relaxed text-[#EDEDFB] relative">
                {[
                  "Har bola uchun shaxsiy o'qituvchi — narxi repetitorning bir ulushiga.",
                  "24/7 ochiq. Bola xohlagan payt gaplashadi, cheksiz takror qiladi.",
                  "Ovozli muloqot — sabrli, baholamaydigan AI bilan bola erkin gapiradi.",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-[#FFBE3D] font-bold text-lg shrink-0">+</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="imkoniyatlar" className="bg-[#FAF8F4] scroll-mt-20">
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-[640px] mb-[52px]">
            <div className="font-bold text-[13px] tracking-[0.12em] uppercase text-[#FF8C42] mb-3.5">
              Imkoniyatlar
            </div>
            <h2 className="landing-font-display font-bold text-3xl md:text-[38px] leading-tight tracking-tight">
              Bitta hamroh — to&apos;rtta kuchli imkoniyat
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
            {[
              {
                icon: "🗣️",
                bg: "#EEEFFB",
                title: "Ovozli AI suhbat",
                desc: "Bola tabiiy ovozda gapiradi, AI tushunadi va javob beradi. Klaviatura ham, savod ham talab qilinmaydi — faqat suhbat.",
              },
              {
                icon: "🔤",
                bg: "#FFF1E3",
                title: "Ingliz tili va talaffuz",
                desc: "Real vaqtda talaffuz tahlili. Har bir so'zga ovozli izoh va to'g'irlash — bola gapirib-gapirib ravon bo'ladi.",
              },
              {
                icon: "📜",
                bg: "#E8FBF4",
                title: "Buyuk Siymolar bilan suhbat",
                desc: "Beruniy, Ibn Sino, Navoiy va Ulug'bek bilan jonli ovozli suhbat. Tarix, fan va madaniyat — qiziqarli hikoya orqali.",
              },
              {
                icon: "📊",
                bg: "#EEEFFB",
                title: "Ota-ona kuzatuv paneli",
                desc: "Bola nimaga qiziqyapti, qaysi mavzuda o'sdi, qancha vaqt sarfladi — barchasi haqiqiy vaqt hisobotlarida.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white border border-[rgba(22,22,42,0.07)] rounded-[22px] p-8 flex flex-col gap-3.5"
              >
                <div
                  className="w-[54px] h-[54px] rounded-[15px] flex items-center justify-center text-2xl"
                  style={{ background: f.bg }}
                >
                  {f.icon}
                </div>
                <h3 className="landing-font-display font-semibold text-[21px]">{f.title}</h3>
                <p className="text-[15.5px] leading-relaxed text-[#5A5A72] m-0">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="qanday" className="bg-white border-t border-[rgba(22,22,42,0.06)] scroll-mt-20">
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center max-w-[620px] mx-auto mb-[60px]">
            <div className="font-bold text-[13px] tracking-[0.12em] uppercase text-[#FF8C42] mb-3.5">
              Qanday ishlaydi
            </div>
            <h2 className="landing-font-display font-bold text-3xl md:text-[38px] leading-tight tracking-tight">
              Uch oddiy qadam
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
            {[
              { n: 1, bg: "#3E41DE", title: "Ro'yxatdan o'ting", desc: "Ota-ona sifatida hisob oching va bolangiz profilini yarating." },
              { n: 2, bg: "#FF8C42", title: "Bola gapiradi", desc: "Mikrofonni bosadi va o'z tilida yoki inglizcha erkin gapiradi." },
              { n: 3, bg: "#1B8A6B", title: "Ota-ona kuzatadi", desc: "Panelda rivojlanish, qiziqishlar va yutuqlarni real vaqtda ko'radi." },
            ].map((step) => (
              <div key={step.n} className="flex flex-col gap-4 text-center items-center p-2">
                <div
                  className="w-[72px] h-[72px] rounded-[22px] text-white landing-font-display font-bold text-[26px] flex items-center justify-center"
                  style={{ background: step.bg }}
                >
                  {step.n}
                </div>
                <h3 className="landing-font-display font-semibold text-xl mt-1.5">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#5A5A72] max-w-[280px] m-0">{step.desc}</p>
                {step.n === 1 && (
                  <Link
                    href={PARENT_ROUTES.register}
                    className="text-sm font-semibold text-[#3E41DE] hover:underline mt-1"
                  >
                    Ro&apos;yxatdan o&apos;tish →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARENT */}
      <section id="ota-ona" className="bg-[#FAF8F4] border-t border-[rgba(22,22,42,0.06)] scroll-mt-20">
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#EEEFFB] border border-[#D8DAF7] text-[#3E41DE] font-bold text-[13px] px-3.5 py-[7px] rounded-full mb-[22px]">
              👨‍👩‍👧 Ota-onalar uchun
            </div>
            <h2 className="landing-font-display font-bold text-3xl md:text-[38px] leading-tight tracking-tight mb-[18px]">
              Farzandingiz rivojini bir qarashda ko&apos;ring
            </h2>
            <p className="text-[17.5px] leading-relaxed text-[#4A4A63] mb-[30px] max-w-[470px]">
              {BRAND.name} har suhbatni tahlil qiladi va sizga tushunarli hisobot beradi. Farzandingiz
              nimaga qiziqyapti, qayerda qiynalyapti va qanchalik o&apos;syapti — hammasi ochiq.
            </p>
            <div className="flex flex-col gap-5 max-w-[440px]">
              {[
                { icon: "🎯", bg: "#EEEFFB", title: "Qiziqishlar xaritasi", desc: "Bola qaysi mavzularda ko'p gaplashadi — fan, til, tarix yoki ijod." },
                { icon: "📈", bg: "#FFF1E3", title: "Haftalik rivojlanish", desc: "Talaffuz, so'z boyligi va faollikning aniq o'sish grafigi." },
                { icon: "🔔", bg: "#E8FBF4", title: "Haftalik xulosa", desc: "Har hafta oxirida qisqa, tushunarli hisobot to'g'ridan-to'g'ri sizga." },
              ].map((item) => (
                <div key={item.title} className="flex gap-[15px]">
                  <div
                    className="w-11 h-11 rounded-[13px] flex items-center justify-center text-xl shrink-0"
                    style={{ background: item.bg }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="landing-font-display font-semibold text-[16.5px] mb-0.5">{item.title}</div>
                    <div className="text-[14.5px] leading-snug text-[#5A5A72]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={PARENT_ROUTES.register}
                className="inline-block bg-[#3E41DE] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-[0_6px_18px_rgba(39,42,140,0.22)] hover:brightness-110 transition-all"
              >
                Ro&apos;yxatdan o&apos;tish →
              </Link>
              <Link
                href={PARENT_ROUTES.login}
                className="inline-block bg-white text-[#3E41DE] font-semibold text-sm px-6 py-3 rounded-xl border border-[#3E41DE]/25 hover:bg-[#EEEFFB] transition-all"
              >
                Ota-ona paneli — kirish
              </Link>
            </div>
          </div>
          <ParentDashboardMock />
        </div>
      </section>

      {/* INVESTOR */}
      <section id="investor" className="bg-[#1E2066] text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute -top-20 -left-[60px] w-[280px] h-[280px] rounded-full bg-[rgba(39,42,140,0.5)] blur-[40px]" />
        <div className="absolute -bottom-[100px] -right-10 w-[320px] h-[320px] rounded-full bg-[rgba(255,140,66,0.14)] blur-[50px]" />
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-20 md:py-[100px] relative">
          <div className="max-w-[700px] mb-14">
            <div className="inline-flex items-center gap-2 bg-[rgba(255,179,71,0.14)] border border-[rgba(255,179,71,0.3)] text-[#FFBE3D] font-semibold text-[13px] px-3.5 py-[7px] rounded-full mb-[22px]">
              Blue ocean — to&apos;g&apos;ridan-to&apos;g&apos;ri raqobatchi yo&apos;q
            </div>
            <h2 className="landing-font-display font-bold text-3xl md:text-[40px] leading-tight tracking-tight mb-[18px]">
              Ochiq bozor, madaniy o&apos;zak, mudofaa qobiliyati
            </h2>
            <p className="text-lg leading-relaxed text-[#B9BAE0] max-w-[600px]">
              O&apos;zbek tilida ovozli AI hozircha bozorda yo&apos;q. Duolingo va Khan Kids global, lekin
              o&apos;zbek tili va madaniy mazmunni — Buyuk Siymolar bilan suhbatni — takrorlay olmaydi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-[22px] overflow-hidden">
            {[
              { v: "1.3M+", l: "7–12 yoshli bolalar — to'g'ridan-to'g'ri maqsadli auditoriya", gold: false },
              { v: "$300M+", l: "Ingliz ta'limi va repetitorlik bozori hajmi (taxminiy)", gold: true },
              { v: "0", l: "O'zbek tilidagi ovozli AI ta'lim raqobatchisi", gold: false },
            ].map((stat) => (
              <div key={stat.v} className="bg-[#282A7A] p-8 md:p-[38px_32px]">
                <div
                  className={`landing-font-display font-extrabold text-[46px] tracking-tight leading-none ${stat.gold ? "text-[#FFBE3D]" : "text-white"}`}
                >
                  {stat.v}
                </div>
                <div className="text-[15px] text-[#B9BAE0] mt-2.5 leading-snug">{stat.l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3.5 mt-8">
            {[
              { t: "🛡️ Mudofaa: madaniy o'zak", d: "Buyuk Siymolar va o'zbek kontekstini global o'yinchilar mahalliylashtira olmaydi." },
              { t: "📈 Yuqori smartfon qamrovi", d: "Yosh aholi va o'sib borayotgan internet — tez tarqalish uchun zamin tayyor." },
            ].map((card) => (
              <div
                key={card.t}
                className="flex-1 min-w-[240px] bg-white/5 border border-white/10 rounded-2xl px-6 py-[22px]"
              >
                <div className="landing-font-display font-semibold text-base mb-[7px]">{card.t}</div>
                <div className="text-[14.5px] text-[#A9AAD4] leading-snug">{card.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KIDS */}
      <section
        id="bolalar"
        className="bg-gradient-to-b from-[#FFF7EE] to-[#FFEFDC] scroll-mt-20"
      >
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#FFD9B0] text-[#B65A12] font-bold text-[13px] px-3.5 py-[7px] rounded-full mb-[22px]">
              🎮 Bolalar uchun
            </div>
            <h2 className="landing-font-display font-extrabold text-3xl md:text-[40px] leading-[1.08] tracking-tight mb-[18px]">
              AI do&apos;sting bilan o&apos;rgan — har kuni yangi yutuq!
            </h2>
            <p className="text-[17.5px] leading-relaxed text-[#6B4A2E] mb-7 max-w-[480px]">
              O&apos;ynab-o&apos;ynab o&apos;rgan. Har suhbatda XP yig&apos;asan, daraja oshirasan, nishonlar
              to&apos;playsan. Buyuk siymolardan bilim ol!
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded-[14px] px-[18px] py-[13px] flex items-center gap-[11px] shadow-[0_6px_16px_rgba(196,120,40,0.12)]">
                <span className="text-[22px]">🔥</span>
                <div>
                  <div className="landing-font-display font-bold text-lg">7 kun</div>
                  <div className="text-xs text-[#9A7A56]">ketma-ket</div>
                </div>
              </div>
              <div className="bg-white rounded-[14px] px-[18px] py-[13px] flex items-center gap-[11px] shadow-[0_6px_16px_rgba(196,120,40,0.12)]">
                <span className="text-[22px]">⭐</span>
                <div>
                  <div className="landing-font-display font-bold text-lg">1 240 XP</div>
                  <div className="text-xs text-[#9A7A56]">bu hafta</div>
                </div>
              </div>
            </div>
            <p className="text-[15px] text-[#9A7A56] mb-4 max-w-[480px]">
              Bola rejimi faqat ota-ona bolani qo&apos;shgandan keyin ochiladi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={PARENT_ROUTES.register}
                className="inline-block bg-[#FF8C42] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-[0_6px_16px_rgba(255,140,66,0.35)] hover:brightness-110 transition-all"
              >
                Avval bolani qo&apos;shish →
              </Link>
              <Link
                href="/child/talk"
                className="inline-block bg-white text-[#B65A12] font-semibold text-sm px-6 py-3 rounded-xl border border-[#FFD9B0] hover:bg-white/80 transition-all"
              >
                Mentorlar bilan tanishish
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-[28px] p-[30px] shadow-[0_30px_60px_-20px_rgba(196,120,40,0.3)]">
            <div className="flex items-center gap-[15px] mb-6">
              <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#3E41DE] to-[#7C80F0] flex items-center justify-center text-[30px]">
                🦊
              </div>
              <div className="flex-1">
                <div className="landing-font-display font-bold text-xl">Dilnoza</div>
                <div className="text-[13.5px] text-[#9A7A56]">Daraja 8 · Tilshunos</div>
              </div>
              <div className="bg-[#FFF1E3] text-[#B65A12] font-bold text-[13px] px-[13px] py-2 rounded-[11px]">
                Lvl 8
              </div>
            </div>
            <div className="flex justify-between text-[12.5px] font-semibold text-[#9A7A56] mb-2">
              <span>Keyingi daraja</span>
              <span>320 / 500 XP</span>
            </div>
            <div className="h-[13px] bg-[#F1ECE3] rounded-lg overflow-hidden mb-[26px]">
              <div className="w-[64%] h-full bg-gradient-to-r from-[#FF8C42] to-[#FFBE3D] rounded-lg" />
            </div>
            <div className="landing-font-display font-semibold text-sm mb-3.5">Yig&apos;ilgan nishonlar</div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: "B", name: "Beruniy", bg: "#EEEFFB", c: "#3E41DE", border: "#D8DAF7" },
                { l: "I", name: "Ibn Sino", bg: "#E8FBF4", c: "#0E7A5A", border: "#C4F0E0" },
                { l: "N", name: "Navoiy", bg: "#FFF1E3", c: "#B65A12", border: "#FFD9B0" },
                { l: "?", name: "Ulug'bek", bg: "#F1ECE3", c: "#C9BBA6", border: "#D9CDBA", locked: true },
              ].map((badge) => (
                <div key={badge.name} className="text-center">
                  <div
                    className={`w-full aspect-square rounded-2xl flex items-center justify-center landing-font-display font-bold text-xl ${badge.locked ? "border-2 border-dashed text-[#C9BBA6]" : "border-2"}`}
                    style={{
                      background: badge.bg,
                      color: badge.c,
                      borderColor: badge.border,
                    }}
                  >
                    {badge.l}
                  </div>
                  <div className={`text-[10.5px] mt-1.5 ${badge.locked ? "text-[#C0AE94]" : "text-[#9A7A56]"}`}>
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA + FORM */}
      <section id="demo" className="bg-[#3E41DE] text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,140,66,0.18),transparent_45%)]" />
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center relative">
          <div>
            <h2 className="landing-font-display font-extrabold text-3xl md:text-[42px] leading-[1.08] tracking-tight mb-[18px]">
              Farzandingiz kelajagini bugun boshlang
            </h2>
            <p className="text-lg leading-relaxed text-[#C7C8F0] mb-7 max-w-[460px]">
              Demoga yoziling — birinchi oilalar va hamkorlar qatoriga qo&apos;shiling. Sizga eng mos
              rejani ko&apos;rsatamiz.
            </p>
            <div className="flex flex-col gap-3.5 text-[15.5px] text-[#C7C8F0]">
              {[
                "Bepul demo va shaxsiy maslahat",
                "O'zbek tilida ovozli AI — birinchilardan bo'ling",
                "Investor va hamkorlar uchun alohida taqdimot",
              ].map((t) => (
                <div key={t} className="flex items-center gap-[11px]">
                  <span className="w-[22px] h-[22px] rounded-full bg-[#FFBE3D] text-[#3E41DE] inline-flex items-center justify-center text-[13px] font-extrabold">
                    ✓
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <DemoForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#191B57] text-white">
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 pt-14 pb-10 flex flex-wrap justify-between gap-10">
          <div className="max-w-[300px]">
            <div className="mb-3.5">
              <LandingLogo light />
            </div>
            <p className="text-sm leading-relaxed text-[#9A9BC4] m-0">
              O&apos;zbek bolalari uchun ovozli AI ta&apos;lim hamrohi. Ingliz tili, buyuk siymolar va
              shaxsiy rivojlanish — bitta suhbatda.
            </p>
          </div>
          <div className="flex flex-wrap gap-14">
            <div>
              <div className="landing-font-display font-semibold text-sm mb-3.5">Mahsulot</div>
              <div className="flex flex-col gap-2.5 text-sm text-[#9A9BC4]">
                <a href="#imkoniyatlar" className="hover:text-white transition-colors">
                  Imkoniyatlar
                </a>
                <a href="#qanday" className="hover:text-white transition-colors">
                  Qanday ishlaydi
                </a>
                <Link href={PARENT_ROUTES.register} className="hover:text-white transition-colors">
                  Ro&apos;yxatdan o&apos;tish
                </Link>
                <Link href={PARENT_ROUTES.login} className="hover:text-white transition-colors">
                  Ota-ona kirish
                </Link>
                <Link href="/child" className="hover:text-white transition-colors">
                  Bolalar uchun
                </Link>
                <Link href={PARENT_ROUTES.subscription} className="hover:text-white transition-colors">
                  Tariflar
                </Link>
              </div>
            </div>
            <div>
              <div className="landing-font-display font-semibold text-sm mb-3.5">Aloqa</div>
              <div className="flex flex-col gap-2.5 text-sm text-[#9A9BC4]">
                <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-white transition-colors">
                  {BRAND.supportEmail}
                </a>
                <Link href="/transparency" className="hover:text-white transition-colors">
                  Shaffoflik
                </Link>
                <span>Toshkent, O&apos;zbekiston</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-5 text-[13px] text-[#75769E]">
            {BRAND.footerLegal}
          </div>
        </div>
      </footer>
    </div>
  );
}
