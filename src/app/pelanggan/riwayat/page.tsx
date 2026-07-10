import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  formatCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
} from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/StatusBadge";
import { History } from "lucide-react";

export const revalidate = 0;

export default async function RiwayatPage() {
  const session = await requireAuth(["PELANGGAN"]);
  if (!session) return null;

  const orders = await prisma.order.findMany({
    include: {
      items: { include: { price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Laundry</h1>
      <p className="text-sm text-gray-500 mb-6">
        Seluruh riwayat pesanan laundry
      </p>

      {orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-600">Belum ada riwayat</p>
          <p className="text-sm text-gray-400 mt-1">Riwayat pesanan akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card hover:shadow-md transition-shadow">
              {/* Header baris atas */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={order.status} />
                  <PaymentBadge status={order.paymentStatus} />
                </div>
              </div>

              {/* Detail layanan */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-700">
                      {item.price.name}
                      <span className="text-gray-400 text-xs ml-1">
                        ({item.weight} {item.price.unit})
                      </span>
                    </span>
                    <span className="text-gray-600">
                      
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="text-lg font-bold text-primary-600">
                    
                  </p>
                  <p className="text-xs text-gray-400">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                  </p>
                </div>
                {order.estimasiSelesai && (
                  <p className="text-xs text-gray-500 text-right">
                    Estimasi selesai:<br />
                    <span className="text-blue-600 font-medium">
                      {formatDate(order.estimasiSelesai)}
                    </span>
                  </p>
                )}
                {order.notes && (
                  <p className="text-xs text-gray-400 max-w-[200px] text-right italic">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
