import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BRAND_LOGO, HERO_AVATAR, getFigureAccent, getFigureAvatar } from "@/lib/design/avatars";
import { FIGURE_CATALOG } from "@/lib/rag/figuresCatalog";

const FEATURED_SLUGS = ["al-xorazmiy", "ibn-sino", "mirzo-ulugbek"];

export default function HomePage() {
  const featured = FIGURE_CATALOG.filter((f) => FEATURED_SLUGS.includes(f.slug));

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-on-surface selection:bg-primary-container selection:text-white">
      <nav className="bg-white sticky top-0 z-40 w-full border-b border-surface-variant shadow-soft-blue">
        <div className="flex justify-between items-center h-20 px-4 md:px-16 max-w-7xl mx-auto">
          <BrandLogo />
          <ul className="hidden md:flex items-center gap-10">
            <li>
              <a href="#mentors" className="font-bold text-sm text-outline hover:text-primary pb-1 transition-all">
                AI Mentorlar
              </a>
            </li>
            <li>
              <Link href="/subscription" className="font-bold text-sm text-outline hover:text-primary pb-1 transition-all">
                Tariflar
              </Link>
            </li>
          </ul>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="font-bold text-xs text-primary hover:text-primary-hover px-4 py-2 rounded-full transition-colors"
            >
              Kirish
            </Link>
            <Link
              href="/home"
              className="font-extrabold text-xs bg-primary text-on-primary py-3 px-6 rounded-full shadow-btn-primary hover:shadow-lg hover:bg-primary-hover transition-all active:scale-95"
            >
              Boshlash
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-16 py-8 md:py-16 flex flex-col gap-12 md:gap-24">
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
          <div className="md:col-span-8 bg-white border border-surface-container-low rounded-[32px] shadow-vibrant-primary p-6 md:p-16 flex flex-col justify-center relative overflow-hidden min-h-[420px]">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl animate-pulse" />

            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1 py-1.5 px-4 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-xs mb-6 shadow-sm">
                ✨ Ta&apos;limning kelajagiga xush kelibsiz
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface mb-6 leading-tight tracking-tight">
                Merosimizdagi{" "}
                <span className="text-primary font-black">AI mentorlar</span> bilan o&apos;z
                salohiyatingizni oching
              </h1>
              <p className="font-medium text-sm md:text-base text-outline mb-8 leading-relaxed max-w-md">
                Matematika, fan va astronomiyani O&apos;zbekistonning buyuk olimlari raqamli
                avatarlari bilan o&apos;rganing — bolalar uchun xavfsiz AI muhit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/home"
                  className="font-extrabold text-xs bg-primary hover:bg-primary-hover text-on-primary py-4 px-8 rounded-full shadow-btn-primary hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  O&apos;rganishni boshlash →
                </Link>
                <Link
                  href="/dashboard"
                  className="font-extrabold text-xs bg-white border-2 border-surface-variant text-on-surface-variant py-4 px-8 rounded-full hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Ota-ona paneli
                </Link>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-secondary-container/10 border border-secondary-container/20 rounded-[32px] shadow-vibrant-secondary p-4 relative flex items-center justify-center overflow-hidden min-h-[280px] md:min-h-0 group">
            <Image
              src={HERO_AVATAR}
              alt="Mirzo Ulug'bek 3D avatar"
              width={400}
              height={480}
              className="w-full h-full object-cover rounded-[24px] z-10 group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          </div>
        </section>

        <section id="mentors" className="flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="font-black text-2xl md:text-3xl text-on-surface tracking-tight">
                AI mentorlaringiz bilan tanishing
              </h2>
              <p className="font-medium text-xs md:text-sm text-outline mt-1">
                Oltin davr ustozlaridan o&apos;rganing.
              </p>
            </div>
            <Link
              href="/figures"
              className="flex items-center gap-1 font-extrabold text-xs text-primary hover:text-primary-hover transition-colors"
            >
              Barcha mentorlar →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((figure) => {
              const accent = getFigureAccent(figure.slug);
              const avatar = getFigureAvatar(figure.slug);
              return (
                <div
                  key={figure.slug}
                  className={`bg-white rounded-[32px] border border-surface-container-low ${accent.shadow} p-6 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 w-full h-2 ${accent.bar}`} />
                  <div>
                    <div className="flex items-center gap-4 mb-6 mt-2">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-surface-container-low border border-surface-variant">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt={figure.nameUz}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-3xl">🌟</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-on-surface group-hover:text-primary transition-colors leading-tight">
                          {figure.nameUz}
                        </h3>
                        <p className={`text-[10px] font-extrabold uppercase tracking-widest mt-1 ${accent.badge}`}>
                          {figure.field}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-outline font-medium leading-relaxed mb-6">
                      {figure.era} — {figure.field}
                    </p>
                  </div>
                  <Link
                    href={`/figures/${figure.slug}`}
                    className="w-full py-3.5 rounded-2xl bg-surface-container text-on-surface-variant font-extrabold text-xs hover:bg-primary hover:text-on-primary transition-all flex justify-center items-center gap-2 border border-transparent hover:border-primary/10 shadow-sm text-center"
                  >
                    Suhbat boshlash 💬
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-primary border border-primary/20 rounded-[32px] text-on-primary p-6 md:p-16 shadow-vibrant-primary relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">
                AI ta&apos;limni sinab ko&apos;ring
              </h2>
              <p className="font-semibold text-xs md:text-sm text-on-primary-container mb-8 leading-relaxed">
                SafarAI bolalar uchun xavfsiz filtrlar, ota-ona kuzatuvi va haftalik
                insight hisobotlari bilan ishlaydi.
              </p>
              <Link
                href="/home"
                className="inline-flex font-extrabold text-xs bg-white text-primary py-4 px-8 rounded-full shadow-lg hover:bg-primary-fixed transition-all"
              >
                Bola interfeysiga o&apos;tish
              </Link>
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-6 border border-white/20 shadow-xl">
                <div className="font-black text-lg md:text-xl text-white">7 ta</div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-on-primary-container">
                  Buyuk Siymolar
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-6 border border-white/20 shadow-xl ml-0 lg:ml-8">
                <div className="font-black text-lg md:text-xl text-white">100%</div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-on-primary-container">
                  Xavfsiz AI filtr
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-surface-variant mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-10 px-4 md:px-16 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Image src={BRAND_LOGO} alt="" width={28} height={28} className="rounded-full" unoptimized />
              <span className="font-black text-primary text-lg">Smart Edu Uzbekistan</span>
            </div>
            <p className="font-medium text-xs text-outline max-w-sm">
              © 2026 Smart Edu UZ · SafarAI — bolalar uchun xavfsiz AI ta&apos;lim platformasi
            </p>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <li>
              <Link href="/transparency" className="font-semibold text-xs text-outline hover:text-primary transition-colors">
                Shaffoflik
              </Link>
            </li>
            <li>
              <Link href="/login" className="font-semibold text-xs text-outline hover:text-primary transition-colors">
                Kirish
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
