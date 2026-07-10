import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "daily";
  const month = parseInt(searchParams.get("month") || `${new Date().getMonth() + 1}`);
  const year = parseInt(searchParams.get("year") || `${new Date().getFullYear()}`);
  const day = parseInt(searchParams.get("day") || `${new Date().getDate()}`);

  let startDate: Date;
  let endDate: Date;

  if (type === "daily") {
    startDate = new Date(year, month - 1, day, 0, 0, 0);
    endDate = new Date(year, month - 1, day, 23, 59, 59);
  } else {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  }

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    orderBy: { date: "desc" },
  });

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return NextResponse.json({
    expenses,
    totalAmount,
    period: { type, day, month, year },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { description, amount, category, date } = body;

  if (!description || !amount) {
    return NextResponse.json(
      { error: "Deskripsi dan jumlah wajib diisi" },
      { status: 400 }
    );
  }

  if (amount <= 0) {
    return NextResponse.json(
      { error: "Jumlah harus lebih dari 0" },
      { status: 400 }
    );
  }

  const expense = await prisma.expense.create({
    data: {
      description,
      amount: parseFloat(amount),
      category: category || "Operasional",
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
