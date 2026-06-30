import { ChildProvider } from "@/lib/child/ChildProvider";
import "./child.css";

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChildProvider>
      <div className="child-theme">{children}</div>
    </ChildProvider>
  );
}
