import { ParentProvider } from "@/lib/parent/ParentProvider";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentProvider>
      <div className="parent-theme min-h-screen">{children}</div>
    </ParentProvider>
  );
}
