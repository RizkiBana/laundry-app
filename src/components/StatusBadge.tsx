import { cn, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("badge", ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-800")}>
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    BELUM_LUNAS: "bg-red-100 text-red-800",
    LUNAS: "bg-green-100 text-green-800",
  };
  const labels: Record<string, string> = {
    BELUM_LUNAS: "Belum Lunas",
    LUNAS: "Lunas",
  };
  return (
    <span className={cn("badge", colors[status] || "bg-gray-100 text-gray-800")}>
      {labels[status] || status}
    </span>
  );
}
