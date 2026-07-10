import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function PATCH(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, paymentStatus } = await request.json();

  if (!orderId || !paymentStatus) {
    return NextResponse.json(
      { error: "orderId dan paymentStatus wajib diisi" },
      { status: 400 }
    );
  }

  const validStatuses = ["BELUM_LUNAS", "LUNAS"];
  if (!validStatuses.includes(paymentStatus)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });

  return NextResponse.json(order);
}
