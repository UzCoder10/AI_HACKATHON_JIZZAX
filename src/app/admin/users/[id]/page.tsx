import { UserDetailView } from "@/components/admin/views/UserDetailView";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetailView id={id} />;
}
