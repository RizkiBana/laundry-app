import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

function roundLaundryPrice(amount: number) {
  return Math.round(amount / 500) * 500;
}

export async function GET(request: NextRequest) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      {
        customerName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        orderNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        customerPhone: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: {
          include: {
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.order.count({
      where,
    }),
  ]);

  return NextResponse.json({
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
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

  const priceIds = items.map((item: { priceId: string }) => item.priceId);

  const prices = await prisma.laundryPrice.findMany({
    where: {
      id: {
        in: priceIds,
      },
    },
  });

  const priceMap = new Map(
    prices.map((price) => [price.id, price])
  );

  let totalAmount = 0;

  const orderItems = [];

  for (const item of items) {
    const price = priceMap.get(item.priceId);

    if (!price) continue;

    const rawSubtotal = item.weight * price.price;

    const subtotal = roundLaundryPrice(rawSubtotal);

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
      estimasiSelesai: estimasiSelesai
        ? new Date(estimasiSelesai)
        : null,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: {
          price: true,
        },
      },
    },
  });

  return NextResponse.json(order, { status: 201 });
}