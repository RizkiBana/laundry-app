import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  if (session?.role === "ADMIN") {
    redirect("/admin");
  } else if (session?.role === "PELANGGAN") {
    redirect("/pelanggan/status");
  }

  redirect("/login");
}
