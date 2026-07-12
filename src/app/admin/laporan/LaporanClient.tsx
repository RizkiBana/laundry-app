"use client";

import { useState } from "react";
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  XCircle,
  Calendar,
  TrendingDown,
  Wallet,
  Smartphone,
  Banknote,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface LaporanData {
  totalOrders: number;
  totalRevenue: number;
  totalLunas: number;
  totalBelumLunas: number;
  totalPengeluaran: number;
  netProfit: number;

  totalQris: number;
  totalTunai: number;

  orders: Order[];
  period: {
    type: string;
    day: number;
    month: number;
    year: number;
  };
}

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

export default function LaporanClient({ initialData }: { initialData: LaporanData }) {
  const [data, setData] = useState(initialData);
  const [type, setType] = useState<"daily" | "monthly">("monthly");
  const [month, setMonth] = useState(initialData.period.month);
  const [year, setYear] = useState(initialData.period.year);
  const [day, setDay] = useState(initialData.period.day);
  const [loading, setLoading] = useState(false);

  async function fetchReport() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        month: String(month),
        year: String(year),
        day: String(day),
      });
      const res = await fetch(`/api/laporan?${params}`);
      const result = await res.json();
      setData(result);
    } catch {
      alert("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }

  const stats = [
  {
    label: "Total Pesanan",
    value: data.totalOrders,
    icon: ShoppingBag,
    color: "text-blue-600 bg-blue-100",
  },
  {
    label: "Total Pendapatan",
    value: formatCurrency(data.totalRevenue),
    icon: TrendingUp,
    color: "text-green-600 bg-green-100",
  },
  {
    label: "Total Pengeluaran",
    value: formatCurrency(data.totalPengeluaran),
    icon: TrendingDown,
    color: "text-red-600 bg-red-100",
  },
  {
    label: "Laba Bersih",
    value: formatCurrency(data.netProfit),
    icon: Wallet,
    color:
      data.netProfit >= 0
        ? "text-emerald-600 bg-emerald-100"
        : "text-red-600 bg-red-100",
  },

  {
    label: "Pendapatan QRIS",
    value: formatCurrency(data.totalQris),
    icon: Smartphone,
    color: "text-indigo-600 bg-indigo-100",
  },
  {
    label: "Pendapatan Tunai",
    value: formatCurrency(data.totalTunai),
    icon: Banknote,
    color: "text-yellow-700 bg-yellow-100",
  },

  {
    label: "Transaksi Lunas",
    value: data.totalLunas,
    icon: CreditCard,
    color: "text-purple-600 bg-purple-100",
  },
  {
    label: "Belum Lunas",
    value: data.totalBelumLunas,
    icon: XCircle,
    color: "text-red-600 bg-red-100",
  },
];

  return (
    <div>
      {/* Filter */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Jenis Laporan</label>
            <div className="flex gap-2">
              <button
                onClick={() => setType("daily")}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  type === "daily"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => setType("monthly")}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  type === "monthly"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>

          {type === "daily" && (
            <div>
              <label className="label">Tanggal</label>
              <input
                type="number"
                className="input w-20"
                value={day}
                min={1}
                max={31}
                onChange={(e) => setDay(parseInt(e.target.value))}
              />
            </div>
          )}

          <div>
            <label className="label">Bulan</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="input w-auto"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tahun</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input w-auto"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchReport}
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <Calendar className="h-4 w-4" />
            {loading ? "Memuat..." : "Tampilkan"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Net Profit Banner */}
      <div className={`mb-6 p-4 rounded-xl border-2 ${
        data.netProfit >= 0
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Ringkasan Keuangan — {type === "daily" ? `${day} ` : ""}{MONTHS[month - 1]} {year}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Pendapatan {formatCurrency(data.totalRevenue)} − Pengeluaran {formatCurrency(data.totalPengeluaran)}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${data.netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {data.netProfit >= 0 ? "+" : ""}{formatCurrency(data.netProfit)}
            </p>
            <p className={`text-xs ${data.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {data.netProfit >= 0 ? "Laba Bersih ✓" : "Merugi"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800">
            Detail Pesanan — {type === "daily" ? `${day} ` : ""}{MONTHS[month - 1]} {year}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">No. Pesanan</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Metode</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status Bayar</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-2.5 text-sm">{order.customerName}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`badge ${order.paymentStatus === "LUNAS" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {order.paymentStatus === "LUNAS" ? "Lunas" : "Belum Lunas"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {data.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data untuk periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
