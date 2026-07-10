import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("RizkiGanteng1506", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@laundry.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@laundry.com",
      password: hashedPassword,
      name: "Administrator",
      phone: "088296200530",
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

  console.log("\n✅ Seed selesai!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Login Admin    : username=admin, password=RizkiGanteng1506");
  console.log("  Login Pelanggan: klik tombol [Masuk sebagai Pelanggan]");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
