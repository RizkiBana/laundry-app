"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
} from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/StatusBadge";
import { Plus, X, Trash2, Edit2, Printer } from "lucide-react";

interface Price {
  id: string;
  name: string;
  price: number;
  unit: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  priceId: string;
  weight: number;
  subtotal: number;
  notes?: string | null;
  price: Price;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  notes?: string | null;
  estimasiSelesai?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface FormItem {
  priceId: string;
  weight: number;
  notes: string;
}

const ORDER_STATUSES = [
  { value: "DITERIMA", label: "Pesanan Diterima" },
  { value: "DICUCI", label: "Sedang Dicuci" },
  { value: "DIKERINGKAN", label: "Sedang Dikeringkan" },
  { value: "DISETRIKA", label: "Sedang Disetrika" },
  { value: "SIAP_DIAMBIL", label: "Siap Diambil" },
  { value: "SELESAI", label: "Selesai" },
];

export default function PesananClient({
  initialOrders,
  prices,
}: {
  initialOrders: Order[];
  prices: Price[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [formItems, setFormItems] = useState<FormItem[]>([
    { priceId: prices[0]?.id || "", weight: 1, notes: "" },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("TUNAI");
  const [formNotes, setFormNotes] = useState("");
  const [estimasiSelesai, setEstimasiSelesai] = useState("");

  function resetForm() {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setFormItems([{ priceId: prices[0]?.id || "", weight: 1, notes: "" }]);
    setPaymentMethod("TUNAI");
    setFormNotes("");
    setEstimasiSelesai("");
    setEditOrder(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(order: Order) {
    setEditOrder(order);
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone || "");
    setCustomerAddress(order.customerAddress || "");
    setFormItems(
      order.items.length > 0
        ? order.items.map((item) => ({
            priceId: item.priceId,
            weight: item.weight,
            notes: item.notes || "",
          }))
        : [{ priceId: prices[0]?.id || "", weight: 1, notes: "" }]
    );
    setPaymentMethod(order.paymentMethod);
    setFormNotes(order.notes || "");
    setEstimasiSelesai(
      order.estimasiSelesai ? order.estimasiSelesai.slice(0, 16) : ""
    );
    setShowForm(true);
  }

  function calcTotal() {
    return formItems.reduce((sum, item) => {
      const price = prices.find((p) => p.id === item.priceId);
      return sum + (price ? price.price * (item.weight || 0) : 0);
    }, 0);
  }

  async function refreshOrders() {
    const res = await fetch("/api/pesanan");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editOrder) {
        const res = await fetch(`/api/pesanan/${editOrder.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName,
            customerPhone: customerPhone || null,
            customerAddress: customerAddress || null,
            paymentMethod,
            notes: formNotes || null,
            estimasiSelesai: estimasiSelesai || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal update pesanan");
        }
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === editOrder.id ? updated : o))
        );
      } else {
        const validItems = formItems.filter((i) => i.priceId && i.weight > 0);
        if (validItems.length === 0) {
          alert("Tambahkan minimal 1 layanan dengan berat > 0");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/pesanan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName,
            customerPhone: customerPhone || undefined,
            customerAddress: customerAddress || undefined,
            items: validItems,
            paymentMethod,
            notes: formNotes || undefined,
            estimasiSelesai: estimasiSelesai || undefined,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal buat pesanan");
        }
        await refreshOrders();
      }

      setShowForm(false);
      resetForm();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pesanan ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch(`/api/pesanan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Gagal menghapus pesanan");
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/pesanan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      }
    } catch {
      alert("Gagal update status");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Pesanan</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Buat Pesanan
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editOrder ? "Edit Pesanan" : "Buat Pesanan Baru"}
              </h2>
              <button onClick={() => { setShowForm(false); resetForm(); }}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Data Pelanggan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Pelanggan *</label>
                  <input
                    className="input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama lengkap"
                    required
                  />
                </div>
                <div>
                  <label className="label">Nomor HP</label>
                  <input
                    className="input"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="label">Alamat (opsional)</label>
                <input
                  className="input"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Alamat penjemputan/pengiriman"
                />
              </div>

              {/* Item Layanan */}
              <div>
                <label className="label">Layanan Laundry</label>
                <div className="space-y-2">
                  {formItems.map((item, idx) => {
                    const selectedPrice = prices.find((p) => p.id === item.priceId);
                    const subtotal = selectedPrice
                      ? selectedPrice.price * (item.weight || 0)
                      : 0;
                    return (
                      <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                        <select
                          className="input flex-1 bg-white"
                          value={item.priceId}
                          onChange={(e) =>
                            setFormItems((prev) =>
                              prev.map((fi, i) =>
                                i === idx ? { ...fi, priceId: e.target.value } : fi
                              )
                            )
                          }
                          disabled={!!editOrder}
                        >
                          {prices.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {formatCurrency(p.price)}/{p.unit}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className="input w-20 bg-white"
                            value={item.weight}
                            min={0.1}
                            step={0.1}
                            onChange={(e) =>
                              setFormItems((prev) =>
                                prev.map((fi, i) =>
                                  i === idx
                                    ? { ...fi, weight: parseFloat(e.target.value) || 0 }
                                    : fi
                                )
                              )
                            }
                            disabled={!!editOrder}
                          />
                          <span className="text-xs text-gray-400">
                            {selectedPrice?.unit || "kg"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-primary-600 w-24 text-right">
                          {formatCurrency(subtotal)}
                        </span>
                        {!editOrder && formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-red-400 hover:text-red-600 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!editOrder && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormItems((prev) => [
                        ...prev,
                        { priceId: prices[0]?.id || "", weight: 1, notes: "" },
                      ])
                    }
                    className="mt-2 text-sm text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Layanan
                  </button>
                )}
              </div>

              {/* Total */}
              <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-primary-700">Total Harga</p>
                  <p className="text-xl font-bold text-primary-800">
                    {formatCurrency(editOrder ? editOrder.totalAmount : calcTotal())}
                  </p>
                </div>
                <p className="text-xs text-primary-500 mt-0.5">
                  Dihitung otomatis: berat × harga/satuan
                </p>
              </div>

              {/* Metode & Estimasi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Metode Pembayaran</label>
                  <select
                    className="input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="TUNAI">Tunai</option>
                    <option value="QRIS">QRIS</option>
                    <option value="TRANSFER">Transfer Bank</option>
                  </select>
                </div>
                <div>
                  <label className="label">Estimasi Selesai</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={estimasiSelesai}
                    onChange={(e) => setEstimasiSelesai(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Catatan</label>
                <textarea
                  className="input"
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: pisahkan baju putih, jangan diperas..."
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
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? "Menyimpan..."
                    : editOrder
                    ? "Simpan Perubahan"
                    : "Buat Pesanan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  No. Pesanan
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pelanggan
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Layanan
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status Cucian
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pembayaran
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tanggal
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary-700">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-xs">
                        {item.price.name}{" "}
                        <span className="text-gray-400">
                          ({item.weight} {item.price.unit})
                        </span>
                      </p>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    {/* Status dropdown */}
                    <div className="relative inline-block">
                      <div className="flex items-center gap-1">
                        <StatusBadge status={order.status} />
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="absolute inset-0 opacity-0 w-full cursor-pointer"
                          title="Ubah status"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">▼ klik untuk ubah</p>
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={order.paymentStatus} />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                    {order.estimasiSelesai && (
                      <p className="text-blue-500">
                        Est: {formatDate(order.estimasiSelesai)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(order)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit pesanan"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <a
                        href={`/nota/${order.id}`}
                        target="_blank"
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        title="Cetak nota"
                      >
                        <Printer className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus pesanan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <p className="text-lg mb-1">Belum ada pesanan</p>
                    <p className="text-sm">Klik &quot;Buat Pesanan&quot; untuk memulai</p>
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
