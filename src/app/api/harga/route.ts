import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prices = await prisma.laundryPrice.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(prices);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, price, unit, description } = await request.json();

  if (!name || !price) {
    return NextResponse.json(
      { error: "Nama dan harga wajib diisi" },
      { status: 400 }
    );
  }

  const laundryPrice = await prisma.laundryPrice.create({
    data: { name, price: parseFloat(price), unit: unit || "kg", description },
  });

  return NextResponse.json(laundryPrice, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, price, unit, description, isActive } = await request.json();

  const laundryPrice = await prisma.laundryPrice.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(unit && { unit }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(laundryPrice);
}

export async function DELETE(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  await prisma.laundryPrice.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
