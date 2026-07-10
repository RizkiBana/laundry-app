"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Calendar,
  TrendingDown,
  ShoppingCart,
  Wrench,
  Zap,
  Package,
  X,
} from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: "Operasional", label: "Operasional", icon: Wrench },
  { value: "Belanja", label: "Belanja / Bahan", icon: ShoppingCart },
  { value: "Listrik & Air", label: "Listrik & Air", icon: Zap },
  { value: "Gaji", label: "Gaji Karyawan", icon: Package },
  { value: "Lainnya", label: "Lainnya", icon: Package },
];

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const CATEGORY_COLORS: Record<string, string> = {
  Operasional: "bg-blue-100 text-blue-800",
  Belanja: "bg-orange-100 text-orange-800",
  "Listrik & Air": "bg-yellow-100 text-yellow-800",
  Gaji: "bg-purple-100 text-purple-800",
  Lainnya: "bg-gray-100 text-gray-800",
};

export default function PengeluaranClient({
  initialExpenses,
  initialTotal,
  currentDay,
  currentMonth,
  currentYear,
}: {
  initialExpenses: Expense[];
  initialTotal: number;
  currentDay: number;
  currentMonth: number;
  currentYear: number;
}) {
  // View filter state
  const [viewType, setViewType] = useState<"daily" | "monthly">("daily");
  const [filterDay, setFilterDay] = useState(currentDay);
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);

  // Data state
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [total, setTotal] = useState(initialTotal);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Operasional");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [submitting, setSubmitting] = useState(false);

  async function fetchExpenses() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: viewType,
        day: String(filterDay),
        month: String(filterMonth),
        year: String(filterYear),
      });
      const res = await fetch(`/api/pengeluaran?${params}`);
      const data = await res.json();
      setExpenses(data.expenses);
      setTotal(data.totalAmount);
    } catch {
      alert("Gagal memuat data pengeluaran");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/pengeluaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: parseFloat(amount),
          category,
          date,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan");
      }
      const newExpense = await res.json();
      // Refresh list after adding
      await fetchExpenses();
      resetForm();
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengeluaran ini?")) return;
    try {
      const res = await fetch(`/api/pengeluaran/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setTotal((prev) => prev - (expenses.find((e) => e.id === id)?.amount || 0));
    } catch {
      alert("Gagal menghapus pengeluaran");
    }
  }

  function resetForm() {
    setDescription("");
    setAmount("");
    setCategory("Operasional");
    setDate(new Date().toISOString().slice(0, 16));
  }

  // Group by category for summary
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const periodLabel =
    viewType === "daily"
      ? `${filterDay} ${MONTHS[filterMonth - 1]} ${filterYear}`
      : `${MONTHS[filterMonth - 1]} ${filterYear}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengeluaran</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catat dan pantau pengeluaran operasional laundry</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengeluaran
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tambah Pengeluaran</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Keterangan / Deskripsi *</label>
                <input
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Beli deterjen, bayar listrik..."
                  required
                />
              </div>

              <div>
                <label className="label">Jumlah (Rp) *</label>
                <input
                  type="number"
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  min={0}
                  step="any"
                  required
                />
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-xs text-primary-600 mt-1">
                    {formatCurrency(parseFloat(amount))}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Kategori</label>
                <select
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Tanggal & Waktu</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Tampilkan</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewType("daily")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewType === "daily"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Per Hari
              </button>
              <button
                onClick={() => setViewType("monthly")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewType === "monthly"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Per Bulan
              </button>
            </div>
          </div>

          {viewType === "daily" && (
            <div>
              <label className="label">Tanggal</label>
              <input
                type="number"
                className="input w-20"
                value={filterDay}
                min={1}
                max={31}
                onChange={(e) => setFilterDay(parseInt(e.target.value))}
              />
            </div>
          )}

          <div>
            <label className="label">Bulan</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
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
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="input w-auto"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchExpenses}
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <Calendar className="h-4 w-4" />
            {loading ? "Memuat..." : "Tampilkan"}
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-xl text-white flex-shrink-0">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Pengeluaran</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(total)}</p>
            <p className="text-xs text-gray-400">{periodLabel}</p>
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Per Kategori</p>
          {Object.keys(categoryTotals).length === 0 ? (
            <p className="text-sm text-gray-400">Tidak ada pengeluaran</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(categoryTotals).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-600"}`}>
                    {cat}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Detail Pengeluaran — {periodLabel}
          </h2>
          <span className="text-sm text-gray-500">{expenses.length} item</span>
        </div>

        {expenses.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Belum ada pengeluaran</p>
            <p className="text-sm">untuk periode {periodLabel}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[expense.category] || "bg-gray-100 text-gray-600"}`}>
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <p className="text-sm font-semibold text-red-600 whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </p>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
