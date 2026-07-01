import { ParentProvider } from "@/lib/parent/ParentProvider";
import "./parent-nurture.css";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentProvider>
      <div className="parent-theme parent-nurture min-h-screen">{children}</div>
    </ParentProvider>
  );
}
