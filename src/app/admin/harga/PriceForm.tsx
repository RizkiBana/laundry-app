"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export default function PriceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    try {
      const res = await fetch("/api/harga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menambah layanan");
      setOpen(false);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch {
      alert("Gagal menambah layanan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Tambah Layanan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tambah Layanan Baru</h2>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nama Layanan</label>
                <input
                  name="name"
                  className="input"
                  placeholder="Contoh: Cuci Setrika"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Harga (Rp)</label>
                  <input
                    name="price"
                    type="number"
                    className="input"
                    placeholder="7000"
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="label">Satuan</label>
                  <select name="unit" className="input" defaultValue="kg">
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="m²">m²</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Deskripsi (opsional)</label>
                <input
                  name="description"
                  className="input"
                  placeholder="Keterangan singkat layanan"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
