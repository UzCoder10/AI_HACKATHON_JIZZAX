"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PARENT_ROUTES } from "@/lib/parent/routes";

export function DemoForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("Ota-ona");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (role === "Ota-ona") {
      router.push(PARENT_ROUTES.register);
      return;
    }
    setSubmitted(true);
  }

  const inputClass =
    "w-full px-[15px] py-[13px] rounded-xl border border-[rgba(22,22,42,0.12)] text-[15px] text-[#16162A] bg-[#FAF8F4] outline-none focus:border-[#3E41DE]";

  if (submitted) {
    return (
      <div className="bg-white rounded-[26px] p-8 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.4)] text-center">
        <div className="w-16 h-16 rounded-full bg-[#E8FBF4] text-[#0E7A5A] text-3xl flex items-center justify-center mx-auto mb-[18px]">
          ✓
        </div>
        <div className="landing-font-display font-bold text-[22px] text-[#16162A] mb-2">
          Rahmat, {name || "do&apos;st"}!
        </div>
        <p className="text-[15.5px] text-[#5A5A72] leading-relaxed">
          So&apos;rovingiz qabul qilindi. Tez orada siz bilan bog&apos;lanamiz.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[26px] p-8 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.4)]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="landing-font-display font-bold text-[21px] text-[#16162A] mb-0.5">
          {role === "Ota-ona" ? "Bepul boshlash" : "Demo so&apos;rash"}
        </div>
        {role === "Ota-ona" && (
          <p className="text-[14px] text-[#5A5A72] leading-snug -mt-1 mb-1">
            Ro&apos;yxatdan o&apos;ting, bolangizni qo&apos;shing va panelni oching.
          </p>
        )}
        <input
          type="text"
          required
          placeholder="Ismingiz"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          required={role !== "Ota-ona"}
          placeholder="Telefon yoki email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={inputClass}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`${inputClass} cursor-pointer appearance-none`}
        >
          <option>Ota-ona</option>
          <option>Investor</option>
          <option>Hamkor / Maktab</option>
        </select>
        <button
          type="submit"
          className="mt-1 bg-[#3E41DE] text-white font-bold text-base py-[15px] rounded-[13px] border-none cursor-pointer shadow-[0_10px_24px_rgba(39,42,140,0.3)] hover:brightness-110 transition-all"
        >
          {role === "Ota-ona" ? "Ro'yxatdan o'tish →" : "Yuborish"}
        </button>
        <p className="text-[12.5px] text-[#9A9AB0] text-center">
          Hisobingiz bormi?{" "}
          <Link href={PARENT_ROUTES.login} className="font-semibold text-[#3E41DE] hover:underline">
            Kirish
          </Link>
        </p>
      </form>
    </div>
  );
}
