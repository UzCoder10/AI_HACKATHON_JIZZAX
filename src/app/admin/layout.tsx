import { AdminProvider } from "@/lib/admin/AdminContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import "./admin.css";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminProvider>
  );
}
