import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import PriceForm from "./PriceForm";
import PriceActions from "./PriceActions";
import { Tag } from "lucide-react";

export default async function HargaPage() {
  const prices = await prisma.laundryPrice.findMany({
    orderBy: { name: "asc" },
  });

  const active = prices.filter((p) => p.isActive);
  const inactive = prices.filter((p) => !p.isActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Harga</h1>
          <p className="text-sm text-gray-500 mt-1">
            Harga digunakan otomatis saat membuat pesanan. Total = Berat × Harga/Satuan
          </p>
        </div>
        <PriceForm />
      </div>

      {active.length === 0 && (
        <div className="card text-center py-12 mb-4">
          <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada harga layanan</p>
          <p className="text-sm text-gray-400 mt-1">
            Klik &quot;Tambah Layanan&quot; untuk menambahkan harga
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {active.map((price) => (
          <div key={price.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Tag className="h-4 w-4 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{price.name}</h3>
              </div>
              <PriceActions
                price={{
                  ...price,
                  createdAt: price.createdAt.toISOString(),
                  updatedAt: price.updatedAt.toISOString(),
                }}
              />
            </div>
            <p className="text-2xl font-bold text-primary-600 mb-1">
              {formatCurrency(price.price)}
              <span className="text-sm font-normal text-gray-500">/{price.unit}</span>
            </p>
            {price.description && (
              <p className="text-sm text-gray-500">{price.description}</p>
            )}
          </div>
        ))}
      </div>

      {inactive.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
            Layanan Nonaktif
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactive.map((price) => (
              <div key={price.id} className="card opacity-50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">{price.name}</h3>
                  <PriceActions
                    price={{
                      ...price,
                      createdAt: price.createdAt.toISOString(),
                      updatedAt: price.updatedAt.toISOString(),
                    }}
                  />
                </div>
                <p className="text-xl font-bold text-gray-500 mb-1">
                  {formatCurrency(price.price)}
                  <span className="text-sm font-normal">/{price.unit}</span>
                </p>
                {price.description && (
                  <p className="text-sm text-gray-400">{price.description}</p>
                )}
                <span className="badge bg-red-100 text-red-700 mt-2">Nonaktif</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
