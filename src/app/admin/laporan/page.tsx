import LaporanClient from "./LaporanClient";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const revalidate = 0;

export default async function LaporanPage() {
  const session = await requireAuth(["ADMIN"]);
  if (!session) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const [
    orders,
    lunas,
    belumLunas,
    totalExpenses,
    totalTunai,
    totalQris,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "LUNAS",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: true,
    }),

    prisma.order.count({
      where: {
        paymentStatus: "BELUM_LUNAS",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    }),

    prisma.expense.aggregate({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    // =========================
    // TOTAL PEMBAYARAN TUNAI
    // =========================
    prisma.order.aggregate({
      where: {
        paymentStatus: "LUNAS",
        paymentMethod: "TUNAI",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),

    // =========================
    // TOTAL PEMBAYARAN QRIS
    // =========================
    prisma.order.aggregate({
      where: {
        paymentStatus: "LUNAS",
        paymentMethod: "QRIS",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  const totalRevenue = lunas._sum.totalAmount || 0;
  const totalPengeluaran = totalExpenses._sum.amount || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Laporan Keuangan
      </h1>

      <LaporanClient
        initialData={{
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          totalLunas: lunas._count,
          totalBelumLunas: belumLunas,

          // Tambahan
          totalTunai: totalTunai._sum.totalAmount || 0,
          totalQris: totalQris._sum.totalAmount || 0,

          totalPengeluaran,
          netProfit: totalRevenue - totalPengeluaran,

          orders: orders.map((o) => ({
            ...o,
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
            estimasiSelesai: o.estimasiSelesai?.toISOString() || null,
          })),

          period: {
            type: "monthly",
            day: now.getDate(),
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        }}
      />
    </div>
  );
}