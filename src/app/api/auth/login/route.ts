import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { type, username, password } = await request.json();

    // Login Pelanggan: langsung masuk tanpa password
    if (type === "pelanggan") {
      const pelanggan = await prisma.user.findFirst({
        where: { role: "PELANGGAN" },
      });

      if (!pelanggan) {
        return NextResponse.json(
          { error: "Akun pelanggan tidak ditemukan" },
          { status: 500 }
        );
      }

      await createSession({
        id: pelanggan.id,
        name: pelanggan.name,
        role: pelanggan.role,
      });

      return NextResponse.json({ success: true, redirect: "/pelanggan/status" });
    }

    // Login Admin
    if (type === "admin") {
      if (!username || !password) {
        return NextResponse.json(
          { error: "Username dan password wajib diisi" },
          { status: 400 }
        );
      }

      if (username !== "admin") {
        return NextResponse.json(
          { error: "Username atau password salah" },
          { status: 401 }
        );
      }

      const user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Akun admin tidak ditemukan" },
          { status: 500 }
        );
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Username atau password salah" },
          { status: 401 }
        );
      }

      await createSession({
        id: user.id,
        name: user.name,
        role: user.role,
      });

      return NextResponse.json({ success: true, redirect: "/admin" });
    }

    return NextResponse.json({ error: "Tipe login tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
