import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `LND-${date}-${random}`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  DITERIMA: "Pesanan Diterima",
  DICUCI: "Sedang Dicuci",
  DIKERINGKAN: "Sedang Dikeringkan",
  DISETRIKA: "Sedang Disetrika",
  DILIPAT: "Sedang Dilipat",
  SIAP_DIAMBIL: "Siap Diambil",
  SELESAI: "Selesai",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  DITERIMA: "bg-yellow-100 text-yellow-800",
  DICUCI: "bg-blue-100 text-blue-800",
  DIKERINGKAN: "bg-purple-100 text-purple-800",
  DISETRIKA: "bg-orange-100 text-orange-800",
  DILIPAT: "bg-purple-100 text-purple-800",
  SIAP_DIAMBIL: "bg-green-100 text-green-800",
  SELESAI: "bg-gray-100 text-gray-800",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  BELUM_LUNAS: "Belum Lunas",
  LUNAS: "Lunas",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  TUNAI: "Tunai",
  TRANSFER: "Transfer Bank",
  QRIS: "QRIS",
};
