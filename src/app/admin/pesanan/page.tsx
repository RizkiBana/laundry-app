import { prisma } from "@/lib/prisma";
import PesananClient from "./PesananClient";

export const revalidate = 0;

const PAGE_SIZE = 20;

export default async function PesananPage() {
  const [orders, prices, totalOrders] = await Promise.all([
    prisma.order.findMany({
      take: PAGE_SIZE,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        notes: true,
        estimasiSelesai: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            priceId: true,
            weight: true,
            subtotal: true,
            notes: true,
            price: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                description: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    }),

    prisma.laundryPrice.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.order.count(),
  ]);

  return (
    <PesananClient
      initialOrders={orders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        estimasiSelesai: o.estimasiSelesai?.toISOString() ?? null,
        items: o.items.map((item) => ({
          ...item,
          price: {
            ...item.price,
            createdAt: item.price.createdAt.toISOString(),
            updatedAt: item.price.updatedAt.toISOString(),
          },
        })),
      }))}
      prices={prices.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))}
      initialPage={1}
      initialTotalPages={Math.ceil(totalOrders / PAGE_SIZE)}
    />
  );
}