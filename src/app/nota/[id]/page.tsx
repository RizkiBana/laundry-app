import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export default async function NotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { price: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="min-h-screen bg-white p-8 max-w-md mx-auto">
      <div className="text-center mb-6 border-b pb-4">
        <h1 className="text-xl font-bold">RIZKI LAUNDRY</h1>
        <p className="text-xs text-gray-500">Jl. Kebersihan No. 1, Jakarta</p>
        <p className="text-xs text-gray-500">Telp: 0812-3456-7890</p>
      </div>

      <div className="mb-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">No. Nota</span>
          <span className="font-medium">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tanggal</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pelanggan</span>
          <span>{order.customerName}</span>
        </div>
        {order.customerPhone && (
          <div className="flex justify-between">
            <span className="text-gray-500">Telepon</span>
            <span>{order.customerPhone}</span>
          </div>
        )}
        {order.customerAddress && (
          <div className="flex justify-between">
            <span className="text-gray-500">Alamat</span>
            <span className="text-right max-w-[60%]">{order.customerAddress}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Metode Bayar</span>
          <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
        </div>
      </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-dashed">
            <th className="text-left py-2">Layanan</th>
            <th className="text-center py-2">Berat</th>
            <th className="text-right py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-dashed">
              <td className="py-2">
                <p>{item.price.name}</p>
                <p className="text-xs text-gray-400">{formatCurrency(item.price.price)}/{item.price.unit}</p>
              </td>
              <td className="text-center py-2">
                {item.weight} {item.price.unit}
              </td>
              <td className="text-right py-2">
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {order.notes && (
        <p className="text-xs text-gray-500 mb-4">Catatan: {order.notes}</p>
      )}

      <div className="border-t border-dashed pt-3 mb-4">
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">Status Bayar</span>
          <span className={order.paymentStatus === "LUNAS" ? "text-green-600 font-medium" : "text-red-500"}>
            {order.paymentStatus === "LUNAS" ? "LUNAS" : "BELUM LUNAS"}
          </span>
        </div>
      </div>

      {order.estimasiSelesai && (
        <div className="mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Estimasi Selesai</span>
            <span>{formatDate(order.estimasiSelesai)}</span>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 mb-6">
        <p>Terima kasih atas kepercayaan Anda!</p>
        <p>Simpan nota ini sebagai bukti transaksi.</p>
      </div>

      <div className="no-print text-center">
        <PrintButton />
      </div>
    </div>
  );
}
