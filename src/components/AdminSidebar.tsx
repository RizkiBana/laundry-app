import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Tag,
  Shirt,
  TrendingDown,
} from "lucide-react";
import LogoutButton from "./LogoutButton";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pesanan", label: "Data Pesanan", icon: ShoppingBag },
  { href: "/admin/pembayaran", label: "Data Pembayaran", icon: CreditCard },
  { href: "/admin/harga", label: "Manajemen Harga", icon: Tag },
  { href: "/admin/pengeluaran", label: "Pengeluaran", icon: TrendingDown },
  { href: "/admin/laporan", label: "Laporan", icon: BarChart3 },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary-800 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-primary-700 px-6">
        <Shirt className="h-8 w-8" />
        <div>
          <h1 className="text-lg font-bold">Rizki Laundry</h1>
          <p className="text-xs text-primary-300">Panel Admin</p>
        </div>
      </div>

      <nav className="mt-4 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-100 hover:bg-primary-700 transition-colors mb-1"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-primary-700 p-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-primary-300">Admin</p>
        </div>
        <LogoutButton className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-200 hover:bg-primary-700 transition-colors" />
      </div>
    </aside>
  );
}
