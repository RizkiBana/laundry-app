import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/StatusBadge";
import { ShoppingBag, CreditCard, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboard() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const [
    todayOrders,
    completedOrders,
    processingOrders,
    todayRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.order.count({ where: { status: "SELESAI" } }),
    prisma.order.count({
      where: {
        status: {
          in: ["DITERIMA", "DICUCI", "DIKERINGKAN", "DISETRIKA", "SIAP_DIAMBIL"],
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: "LUNAS",
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = [
    {
      label: "Pesanan Hari Ini",
      value: todayOrders,
      icon: ShoppingBag,
      bg: "bg-blue-500",
    },
    {
      label: "Sedang Diproses",
      value: processingOrders,
      icon: Clock,
      bg: "bg-yellow-500",
    },
    {
      label: "Pesanan Selesai",
      value: completedOrders,
      icon: CreditCard,
      bg: "bg-green-500",
    },
    {
      label: "Pendapatan Hari Ini",
      value: formatCurrency(todayRevenue._sum.totalAmount || 0),
      icon: TrendingUp,
      bg: "bg-purple-500",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label}className="card flex items-center gap-3 p-3 md:p-4">
            <div className={`${stat.bg} p-2 md:p-3 rounded-xl text-white flex-shrink-0`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pesanan Terbaru */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
          <Link
            href="/admin/pesanan"
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>
        <div className="divide-y">
          {recentOrders.map((order) => (
            <div
                key={order.id}
               className="
                flex flex-col gap-3
                md:flex-row md:items-center md:justify-between
                px-4 md:px-6 py-3
                hover:bg-gray-50 transition-colors
                "

            >
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-gray-500">{order.customerName}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={order.status} />
                <PaymentBadge status={order.paymentStatus} />
                <p className="text-sm font-medium text-gray-700 hidden sm:block">
                  {formatCurrency(order.totalAmount)}
                </p>
                <p className="text-xs text-gray-400 hidden lg:block">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400">
              <p>Belum ada pesanan hari ini</p>
              <Link
                href="/admin/pesanan"
                className="mt-2 inline-block text-sm text-primary-600 hover:underline"
              >
                Buat pesanan pertama →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
