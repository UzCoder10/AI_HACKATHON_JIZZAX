"use client";

import { Suspense } from "react";
import { ChildProvider } from "@/lib/child/ChildProvider";
import "./child.css";

function ChildProviderGate({ children }: { children: React.ReactNode }) {
  return <ChildProvider>{children}</ChildProvider>;
}

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-amber-50">⭐</div>}>
      <ChildProviderGate>
        <div className="child-theme child-aqlli min-h-screen">{children}</div>
      </ChildProviderGate>
    </Suspense>
  );
}
