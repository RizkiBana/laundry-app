"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, History, Shirt, Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";

const navItems = [
  {
    href: "/pelanggan/status",
    label: "Cek Status Laundry",
    icon: Search,
  },
  {
    href: "/pelanggan/riwayat",
    label: "Riwayat Laundry",
    icon: History,
  },
];

export default function CustomerSidebar({
  userName,
}: {
  userName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Tombol Menu Mobile */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md border md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Background hitam saat sidebar terbuka */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <Shirt className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Rizki Laundry
              </h1>
              <p className="text-xs text-gray-500">Portal Pelanggan</p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-4 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-gray-900">
              {userName}
            </p>
            <p className="text-xs text-gray-500">
              Pelanggan
            </p>
          </div>

          <LogoutButton className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors" />
        </div>
      </aside>
    </>
  );
}