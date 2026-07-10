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

  return <StatusPageClient initialOrders={orders} />;
}