import { prisma } from "@/lib/prisma";
import PesananClient from "./PesananClient";

export const revalidate = 0;

export default async function PesananPage() {
  const [orders, prices] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { price: true } },
      },
    }),
    prisma.laundryPrice.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PesananClient
      initialOrders={orders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        estimasiSelesai: o.estimasiSelesai?.toISOString() || null,
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
    />
  );
}
