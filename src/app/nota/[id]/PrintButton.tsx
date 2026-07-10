"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary inline-flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Cetak Nota
    </button>
  );
}
