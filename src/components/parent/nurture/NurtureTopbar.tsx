"use client";

import Link from "next/link";
import { PARENT_ROUTES } from "@/lib/parent/routes";
import { MaterialIcon } from "./MaterialIcon";

type Props = {
  title: string;
  onMenuClick?: () => void;
};

export function NurtureTopbar({ title, onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-[#c7c4d8]/20 bg-[#f9f9ff]/80 px-4 py-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#464555] hover:bg-[#dee8ff] md:hidden"
          onClick={onMenuClick}
          aria-label="Menyuni ochish"
        >
          <MaterialIcon name="menu" size="sm" />
        </button>
        <h2 className="text-xl font-bold text-[#3525cd] md:text-2xl">{title}</h2>
        <div className="hidden w-80 items-center gap-2 rounded-full border border-[#c7c4d8]/20 bg-[#f0f3ff] px-4 py-2 md:flex">
          <MaterialIcon name="search" className="text-[#777587] !text-base" />
          <input
            type="search"
            placeholder="Qidirish..."
            className="w-full border-none bg-transparent p-0 text-sm font-semibold text-[#111c2d] outline-none ring-0 placeholder:text-[#777587]"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#464555] hover:bg-[#dee8ff]"
          aria-label="Bildirishnomalar"
        >
          <MaterialIcon name="notifications" size="sm" />
        </button>
        <Link
          href={PARENT_ROUTES.settings}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#464555] hover:bg-[#dee8ff]"
          aria-label="Sozlamalar"
        >
          <MaterialIcon name="settings" size="sm" />
        </Link>
      </div>
    </header>
  );
}
