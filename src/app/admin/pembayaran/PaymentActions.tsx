"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";

export default function PembayaranActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle(paymentStatus: string) {
    setLoading(true);
    try {
      await fetch("/api/pembayaran", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus }),
      });
      router.refresh();
    } catch {
      alert("Gagal mengubah status pembayaran");
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "LUNAS") {
    return (
      <button
        onClick={() => handleToggle("BELUM_LUNAS")}
        disabled={loading}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
      >
        <X className="h-3 w-3" />
        Batalkan
      </button>
    );
  }

  return (
    <button
      onClick={() => handleToggle("LUNAS")}
      disabled={loading}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100"
    >
      <Check className="h-3 w-3" />
      Tandai Lunas
    </button>
  );
}
