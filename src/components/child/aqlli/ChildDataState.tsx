"use client";

import Link from "next/link";
import { PARENT_ROUTES } from "@/lib/parent/routes";

export function ChildLoading({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ece8d9] border-t-[#705d00]" />
      <p className="font-semibold text-[#705d00]">{label}</p>
    </div>
  );
}

export function ChildError({
  message,
  onRetry,
  showParentLinks = false,
}: {
  message: string;
  onRetry?: () => void;
  showParentLinks?: boolean;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-semibold text-[#705d00]">Xatolik</p>
      <p className="max-w-sm text-[#4d4633]">{message}</p>
      {showParentLinks ? (
        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          <Link
            href={PARENT_ROUTES.register}
            className="rounded-full bg-[#4f46e5] px-6 py-2.5 font-bold text-white hover:brightness-110"
          >
            Ro&apos;yxatdan o&apos;tish
          </Link>
          <Link
            href={PARENT_ROUTES.login}
            className="rounded-full bg-[#ffd93d] px-6 py-2.5 font-bold text-[#725e00] hover:brightness-105"
          >
            Ota-ona kirish
          </Link>
        </div>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-[#ffd93d] px-6 py-2 font-bold text-[#725e00] active:scale-95"
        >
          Qayta urinish
        </button>
      ) : null}
    </div>
  );
}

export function ChildEmpty({ message }: { message: string }) {
  return (
    <div className="flex min-h-[24vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[#4d4633]">{message}</p>
    </div>
  );
}
