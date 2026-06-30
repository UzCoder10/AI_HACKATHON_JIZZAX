import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGO } from "@/lib/design/avatars";

export function BrandLogo({
  href = "/",
  size = "md",
  showText = true,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const sizes = { sm: 32, md: 40, lg: 48 };
  const textSizes = { sm: "text-lg", md: "text-xl md:text-2xl", lg: "text-2xl md:text-3xl" };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 group transition-transform duration-200 active:scale-95"
    >
      <Image
        src={BRAND_LOGO}
        alt="Smart Edu Uzbekistan"
        width={sizes[size]}
        height={sizes[size]}
        className="rounded-full shadow-sm object-contain"
        unoptimized
      />
      {showText && (
        <span
          className={`font-extrabold text-primary group-hover:text-primary-hover tracking-tight ${textSizes[size]}`}
        >
          Smart Edu UZ
        </span>
      )}
    </Link>
  );
}
