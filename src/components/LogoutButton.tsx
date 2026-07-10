"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
      }
    >
      <LogOut className="h-4 w-4" />
      Keluar
    </button>
  );
}
