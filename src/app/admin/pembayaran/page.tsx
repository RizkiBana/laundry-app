import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import { PaymentBadge, StatusBadge } from "@/components/StatusBadge";
import PembayaranActions from "./PaymentActions";

export const revalidate = 0;

export default async function PembayaranPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalLunas = orders
    .filter((o) => o.paymentStatus === "LUNAS")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalBelumLunas = orders
    .filter((o) => o.paymentStatus === "BELUM_LUNAS")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Pembayaran</h1>
      <p className="text-sm text-gray-500 mb-6">
        Data diambil langsung dari pesanan. Ubah status pembayaran di kolom paling kanan.
      </p>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">Total Pesanan</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">Sudah Lunas</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalLunas)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">Belum Lunas</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalBelumLunas)}</p>
        </div>
      </div>

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
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Metode
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status Cucian
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status Bayar
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
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <PembayaranActions
                      orderId={order.id}
                      currentStatus={order.paymentStatus}
                    />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Belum ada data pembayaran
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
