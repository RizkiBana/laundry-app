import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { price: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, customerName, customerPhone, customerAddress, notes, paymentMethod, estimasiSelesai } = body;

  const updateData: Record<string, unknown> = {};

  if (status) {
    const validStatuses = [
      "DITERIMA",
      "DICUCI",
      "DIKERINGKAN",
      "DISETRIKA",
      "DILIPAT",
      "SIAP_DIAMBIL",
      "SELESAI",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }
    updateData.status = status;
  }

  if (customerName !== undefined) updateData.customerName = customerName;
  if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
  if (customerAddress !== undefined) updateData.customerAddress = customerAddress;
  if (notes !== undefined) updateData.notes = notes;
  if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
  if (estimasiSelesai !== undefined) {
    updateData.estimasiSelesai = estimasiSelesai ? new Date(estimasiSelesai) : null;
  }

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
    include: { items: { include: { price: true } } },
  });

  return NextResponse.json(order);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
