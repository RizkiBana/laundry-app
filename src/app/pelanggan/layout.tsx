import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import CustomerSidebar from "@/components/CustomerSidebar";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["PELANGGAN"]);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerSidebar userName={session.name} />
      <main className="p-4 md:ml-64 md:p-8 min-h-screen">{children}</main>
    </div>
  );
}
