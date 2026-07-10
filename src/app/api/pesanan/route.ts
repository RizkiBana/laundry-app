import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  // Pelanggan hanya bisa lihat semua pesanan (shared account)
  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    customerName,
    customerPhone,
    customerAddress,
    items,
    notes,
    paymentMethod,
    estimasiSelesai,
  } = body;

  if (!customerName) {
    return NextResponse.json(
      { error: "Nama pelanggan wajib diisi" },
      { status: 400 }
    );
  }

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: "Minimal 1 item pesanan" },
      { status: 400 }
    );
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const price = await prisma.laundryPrice.findUnique({
      where: { id: item.priceId },
    });
    if (!price) continue;

    const subtotal = price.price * item.weight;
    totalAmount += subtotal;
    orderItems.push({
      priceId: item.priceId,
      weight: item.weight,
      subtotal,
      notes: item.notes || null,
    });
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName,
      customerPhone: customerPhone || null,
      customerAddress: customerAddress || null,
      totalAmount,
      notes: notes || null,
      paymentMethod: paymentMethod || "TUNAI",
      estimasiSelesai: estimasiSelesai ? new Date(estimasiSelesai) : null,
      items: { create: orderItems },
    },
    include: {
      items: { include: { price: true } },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
