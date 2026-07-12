import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type") || "monthly";
  const month = parseInt(
    searchParams.get("month") || `${new Date().getMonth() + 1}`
  );
  const year = parseInt(
    searchParams.get("year") || `${new Date().getFullYear()}`
  );
  const day = parseInt(
    searchParams.get("day") || `${new Date().getDate()}`
  );

  let startDate: Date;
  let endDate: Date;

  if (type === "daily") {
    startDate = new Date(year, month - 1, day, 0, 0, 0);
    endDate = new Date(year, month - 1, day, 23, 59, 59);
  } else {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  }

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
          gte: startDate,
          lte: endDate,
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
          gte: startDate,
          lte: endDate,
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
          gte: startDate,
          lte: endDate,
        },
      },
    }),

    prisma.expense.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "LUNAS",
        paymentMethod: "TUNAI",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "LUNAS",
        paymentMethod: "QRIS",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  const totalRevenue = lunas._sum.totalAmount || 0;
  const totalPengeluaran = totalExpenses._sum.amount || 0;

  return NextResponse.json({
    totalOrders: orders.length,
    totalRevenue,
    totalLunas: lunas._count,
    totalBelumLunas: belumLunas,

    totalTunai: (totalTunai._sum.totalAmount || 0) - totalPengeluaran,
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
      type,
      day,
      month,
      year,
    },
  });
}