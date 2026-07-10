import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import StatusPageClient from "./StatusPageClient";

export const revalidate = 0;

export default async function StatusPage() {
  const session = await requireAuth(["PELANGGAN"]);
  if (!session) return null;

  const orders = await prisma.order.findMany({
  where: {
    status: {
      notIn: ["SELESAI"],
    },
  },
  include: {
    items: {
      include: {
        price: true,
      },
    },
  },
  orderBy: {
    updatedAt: "desc",
  },
});

// Ubah semua Date menjadi string
const serializedOrders = orders.map((order) => ({
  ...order,
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
  estimasiSelesai: order.estimasiSelesai
    ? order.estimasiSelesai.toISOString()
    : null,
}));

return <StatusPageClient initialOrders={serializedOrders} />;
}