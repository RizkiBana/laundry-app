import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import PengeluaranClient from "./PengeluaranClient";

export const revalidate = 0;

export default async function PengeluaranPage() {
  const session = await requireAuth(["ADMIN"]);
  if (!session) return null;

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

  const todayExpenses = await prisma.expense.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay } },
    orderBy: { date: "desc" },
  });

  const totalToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <PengeluaranClient
      initialExpenses={todayExpenses.map((e) => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))}
      initialTotal={totalToday}
      currentDay={day}
      currentMonth={month}
      currentYear={year}
    />
  );
}
