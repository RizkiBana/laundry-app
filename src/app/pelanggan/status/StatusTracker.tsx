"use client";

import { Check } from "lucide-react";

const STEPS = [
  { status: "DITERIMA", label: "Diterima" },
  { status: "DICUCI", label: "Dicuci" },
  { status: "DIKERINGKAN", label: "Dikeringkan" },
  { status: "DISETRIKA", label: "Disetrika" },
  { status: "SIAP_DIAMBIL", label: "Siap Diambil" },
  { status: "SELESAI", label: "Selesai" },
];

export default function StatusTracker({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="flex items-start gap-0">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.status} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Garis kiri */}
              <div
                className={`flex-1 h-0.5 ${idx === 0 ? "opacity-0" : isDone || isActive ? "bg-primary-400" : "bg-gray-200"}`}
              />
              {/* Titik */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isDone
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200 scale-110"
                    : "bg-white border-gray-200 text-gray-300"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              {/* Garis kanan */}
              <div
                className={`flex-1 h-0.5 ${isLast ? "opacity-0" : isDone ? "bg-primary-400" : "bg-gray-200"}`}
              />
            </div>
            {/* Label */}
            <p
              className={`text-xs mt-2 text-center leading-tight ${
                isActive
                  ? "text-primary-700 font-semibold"
                  : isDone
                  ? "text-green-600 font-medium"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
