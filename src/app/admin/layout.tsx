import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar userName={session.name} />
      <main className="ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}
