"use client";

import { useState, useMemo } from "react";
import { formatDate } from "@/lib/utils";
import StatusTracker from "./StatusTracker";
import { RefreshCw, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  weight: number;
  notes: string | null;
  price: {
    name: string;
    unit: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  status: string;
  paymentStatus: string;
  notes: string | null;
  estimasiSelesai: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  BELUM_LUNAS: "Belum Lunas",
  LUNAS: "Lunas",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  BELUM_LUNAS: "bg-red-100 text-red-800",
  LUNAS: "bg-green-100 text-green-800",
};

export default function StatusPageClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [orders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filter pesanan berdasarkan nama pelanggan
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(query) ||
        o.orderNumber.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  async function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Cek Status Laundry</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Perbarui
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Pesanan aktif hari ini, {today}
      </p>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white shadow-sm"
          placeholder="Cari nama pelanggan atau nomor pesanan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search result info */}
      {searchQuery && (
        <p className="text-sm text-gray-500 mb-4">
          Menampilkan {filteredOrders.length} hasil untuk &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Content */}
      {orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-lg font-medium text-gray-700">Tidak ada pesanan aktif hari ini</p>
          <p className="text-sm text-gray-400 mt-1">
            Pesanan akan tampil di sini saat admin menambahkan pesanan baru
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-700">Nama tidak ditemukan</p>
          <p className="text-sm text-gray-400 mt-1">
            Coba cari dengan nama lain atau nomor pesanan
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-sm text-primary-600 hover:underline"
          >
            Lihat semua pesanan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="card">
              {/* Header Pesanan */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {order.orderNumber}
                  </h3>
                  <p className="text-sm font-medium text-gray-700">
                    {order.customerName}
                  </p>
                  {order.customerPhone && (
                    <p className="text-xs text-gray-400">{order.customerPhone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    Masuk: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  {/* Status Pembayaran — tanpa nominal harga */}
                  <span
                    className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                      PAYMENT_STATUS_COLORS[order.paymentStatus] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                  Progress Cucian
                </p>
                <StatusTracker currentStatus={order.status} />
              </div>

              {/* Estimasi */}
              {order.estimasiSelesai && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">⏰ Estimasi selesai:</span>{" "}
                    {formatDate(order.estimasiSelesai)}
                  </p>
                </div>
              )}

              {/* Detail Layanan — tanpa harga */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Detail Layanan
                </p>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mr-2 flex-shrink-0" />
                      <span className="text-gray-700">
                        {item.price.name}
                        <span className="text-gray-400 text-xs ml-1">
                          × {item.weight} {item.price.unit}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan */}
              {order.notes && (
                <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <span className="font-medium">📝 Catatan:</span> {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
