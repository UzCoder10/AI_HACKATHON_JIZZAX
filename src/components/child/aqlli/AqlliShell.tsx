"use client";

import { ChildBottomNav } from "./ChildBottomNav";

type Props = {
  children: React.ReactNode;
  showNav?: boolean;
  className?: string;
};

/** Aqlli Do'st layout — parent dizayniga ta'sir qilmaydi */
export function AqlliShell({ children, showNav = true, className = "" }: Props) {
  return (
    <div className={`child-aqlli flex min-h-screen flex-col items-center ${className}`}>
      {children}
      {showNav && <ChildBottomNav />}
    </div>
  );
}
