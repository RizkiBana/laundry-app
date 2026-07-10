"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, Edit2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Price {
  id: string;
  name: string;
  price: number;
  unit: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PriceActions({ price }: { price: Price }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(price.name);
  const [harga, setHarga] = useState(String(price.price));
  const [unit, setUnit] = useState(price.unit);
  const [description, setDescription] = useState(price.description || "");

  async function handleToggleActive() {
    if (
      !confirm(
        price.isActive
          ? `Nonaktifkan layanan "${price.name}"?`
          : `Aktifkan kembali layanan "${price.name}"?`
      )
    )
      return;
    await fetch("/api/harga", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: price.id, isActive: !price.isActive }),
    });
    router.refresh();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/harga", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: price.id,
          name,
          price: parseFloat(harga),
          unit,
          description,
        }),
      });
      setShowEdit(false);
      router.refresh();
    } catch {
      alert("Gagal update harga");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex gap-1">
        <button
          onClick={() => setShowEdit(true)}
          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
          title="Edit harga"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleToggleActive}
          className={`p-1 rounded ${
            price.isActive
              ? "text-red-500 hover:bg-red-50"
              : "text-green-600 hover:bg-green-50"
          }`}
          title={price.isActive ? "Nonaktifkan" : "Aktifkan"}
        >
          {price.isActive ? (
            <Trash2 className="h-4 w-4" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </button>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Harga</h2>
              <button onClick={() => setShowEdit(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="label">Nama Layanan</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Harga (Rp)</label>
                  <input
                    type="number"
                    className="input"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="label">Satuan</label>
                  <select
                    className="input"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="m²">m²</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Deskripsi</label>
                <input
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan singkat layanan"
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                Harga sebelumnya:{" "}
                <span className="font-medium text-gray-700">
                  {formatCurrency(price.price)}/{price.unit}
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
