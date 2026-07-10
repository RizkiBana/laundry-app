import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "monthly"; // daily | monthly
  const month = parseInt(searchParams.get("month") || `${new Date().getMonth() + 1}`);
  const year = parseInt(searchParams.get("year") || `${new Date().getFullYear()}`);
  const day = parseInt(searchParams.get("day") || `${new Date().getDate()}`);

  let startDate: Date;
  let endDate: Date;

  if (type === "daily") {
    startDate = new Date(year, month - 1, day, 0, 0, 0);
    endDate = new Date(year, month - 1, day, 23, 59, 59);
  } else {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  }

  const [orders, lunas, belumLunas] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: "LUNAS",
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.count({
      where: {
        paymentStatus: "BELUM_LUNAS",
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
  ]);

  return NextResponse.json({
    totalOrders: orders.length,
    totalRevenue: lunas._sum.totalAmount || 0,
    totalLunas: lunas._count,
    totalBelumLunas: belumLunas,
    orders,
    period: { type, day, month, year },
  });
}
