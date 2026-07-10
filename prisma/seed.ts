import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@laundry.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@laundry.com",
      password: hashedPassword,
      name: "Administrator",
      phone: "081234567890",
      role: "ADMIN",
    },
  });

  // Akun pelanggan bersama (shared)
  await prisma.user.upsert({
    where: { email: "pelanggan@laundry.com" },
    update: {},
    create: {
      email: "pelanggan@laundry.com",
      password: hashedPassword,
      name: "Pelanggan",
      role: "PELANGGAN",
    },
  });

  // Harga layanan
  const services = [
    { name: "Cuci Reguler", price: 7000, unit: "kg", description: "Cuci + setrika, selesai 2-3 hari" },
    { name: "Cuci Express", price: 12000, unit: "kg", description: "Selesai dalam 1 hari" },
    { name: "Cuci Kering", price: 5000, unit: "kg", description: "Cuci tanpa setrika" },
    { name: "Setrika Saja", price: 4000, unit: "kg", description: "Setrika saja tanpa cuci" },
    { name: "Dry Clean", price: 25000, unit: "pcs", description: "Jas, gaun, bahan halus" },
    { name: "Bed Cover", price: 35000, unit: "pcs", description: "Cuci sprei & bed cover" },
    { name: "Selimut", price: 20000, unit: "pcs", description: "Cuci selimut tebal" },
    { name: "Karpet", price: 15000, unit: "m²", description: "Cuci karpet per meter persegi" },
  ];

  for (const svc of services) {
    const existing = await prisma.laundryPrice.findFirst({
      where: { name: svc.name },
    });
    if (!existing) {
      await prisma.laundryPrice.create({ data: svc });
    }
  }

  // Demo order
  const reguler = await prisma.laundryPrice.findFirst({
    where: { name: "Cuci Reguler" },
  });
  const express = await prisma.laundryPrice.findFirst({
    where: { name: "Cuci Express" },
  });

  if (reguler && express) {
    const existing = await prisma.order.findFirst({
      where: { orderNumber: "LND-20260101-0001" },
    });
    if (!existing) {
      await prisma.order.create({
        data: {
          orderNumber: "LND-20260101-0001",
          customerName: "Budi Santoso",
          customerPhone: "08123456789",
          customerAddress: "Jl. Merdeka No. 5",
          totalAmount: 35000 + 24000,
          status: "DICUCI",
          paymentStatus: "BELUM_LUNAS",
          paymentMethod: "TUNAI",
          notes: "Pisahkan baju putih",
          estimasiSelesai: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          items: {
            create: [
              {
                priceId: reguler.id,
                weight: 5,
                subtotal: 35000,
                notes: "5 kg cuci reguler",
              },
              {
                priceId: express.id,
                weight: 2,
                subtotal: 24000,
                notes: "2 kg express",
              },
            ],
          },
        },
      });

      await prisma.order.create({
        data: {
          orderNumber: "LND-20260101-0002",
          customerName: "Siti Rahayu",
          customerPhone: "08987654321",
          totalAmount: 28000,
          status: "SIAP_DIAMBIL",
          paymentStatus: "LUNAS",
          paymentMethod: "QRIS",
          items: {
            create: [
              {
                priceId: reguler.id,
                weight: 4,
                subtotal: 28000,
              },
            ],
          },
        },
      });
    }
  }

  console.log("\n✅ Seed selesai!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Login Admin    : username=admin, password=password123");
  console.log("  Login Pelanggan: klik tombol [Masuk sebagai Pelanggan]");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
