"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Tag,
  Shirt,
  TrendingDown,
  Menu,
  X,
} from "lucide-react";

import LogoutButton from "./LogoutButton";


const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/pesanan",
    label: "Data Pesanan",
    icon: ShoppingBag,
  },
  {
    href: "/admin/pembayaran",
    label: "Data Pembayaran",
    icon: CreditCard,
  },
  {
    href: "/admin/harga",
    label: "Manajemen Harga",
    icon: Tag,
  },
  {
    href: "/admin/pengeluaran",
    label: "Pengeluaran",
    icon: TrendingDown,
  },
  {
    href: "/admin/laporan",
    label: "Laporan",
    icon: BarChart3,
  },
];


export default function AdminSidebar({
  userName,
}: {
  userName: string;
}) {

  const [open, setOpen] = useState(false);


  return (
    <>

      {/* Tombol buka sidebar HP */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed
          top-4
          left-4
          z-[60]
          rounded-lg
          bg-primary-800
          p-2
          text-white
          shadow-md
          md:hidden
        "
      >
        <Menu className="h-6 w-6"/>
      </button>



      {/* Overlay HP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            md:hidden
          "
        />
      )}



      {/* Sidebar */}
      <aside
        className={`
          fixed
          top-0
          left-0
          z-50
          h-screen
          w-64
          bg-primary-800
          text-white
          transition-transform
          duration-300

          ${
            open
            ? "translate-x-0"
            : "-translate-x-full"
          }

          md:translate-x-0
        `}
      >


        {/* Header */}
        <div
          className="
            flex
            h-16
            items-center
            justify-between
            border-b
            border-primary-700
            px-6
          "
        >

          <div className="flex items-center gap-2">

            <Shirt className="h-8 w-8"/>

            <div>
              <h1 className="text-lg font-bold">
                Rizki Laundry
              </h1>

              <p className="text-xs text-primary-300">
                Panel Admin
              </p>
            </div>

          </div>


          <button
            onClick={() => setOpen(false)}
            className="md:hidden"
          >
            <X className="h-6 w-6"/>
          </button>


        </div>




        {/* Menu */}
        <nav className="mt-4 px-3">

          {navItems.map((item)=>(
            <Link
              key={item.href}
              href={item.href}
              onClick={()=>setOpen(false)}
              className="
                mb-1
                flex
                items-center
                gap-3
                rounded-lg
                px-3
                py-3
                text-sm
                text-primary-100
                hover:bg-primary-700
                transition
              "
            >

              <item.icon className="h-5 w-5"/>

              <span>
                {item.label}
              </span>

            </Link>
          ))}

        </nav>



        {/* Footer */}
        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            border-t
            border-primary-700
            p-4
          "
        >

          <div className="mb-3 px-2">

            <p className="text-sm font-medium">
              {userName}
            </p>

            <p className="text-xs text-primary-300">
              Admin
            </p>

          </div>


          <LogoutButton
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              text-primary-200
              hover:bg-primary-700
            "
          />


        </div>


      </aside>

    </>
  );
}