"use client";

import {
  Eye,
  Printer,
  FilePlus,
  ReceiptText,
  User,
  Hash,
  Droplets,
  CheckCircle2,
  Clock3,
  FileText,
} from "lucide-react";

interface Props {
  rows: any[];
  loading: boolean;
  onGenerate: (row: any) => void;
  onView?: (bill_id: number) => void;
  onThermal?: (bill_id: number) => void;
  onA4?: (bill_id: number) => void;
}

export default function BillTable({
  rows,
  loading,
  onGenerate,
  onView,
  onThermal,
}: Props) {
  const safeRows = rows ?? [];

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="rounded-[32px] border border-white/40 bg-white/20 backdrop-blur-3xl shadow-2xl px-10 py-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-[3px] border-cyan-500 border-t-transparent animate-spin"></div>

              <div className="absolute inset-0 rounded-full bg-cyan-400 blur-xl opacity-30"></div>
            </div>

            <div>
              <h2 className="font-bold text-slate-700 text-lg">
                Loading Bills...
              </h2>

              <p className="text-slate-500">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!safeRows.length) {
    return (
      <div className="rounded-[36px] border border-white/40 bg-white/20 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,.12)] p-14 text-center">
        <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl">
          <ReceiptText size={48} className="text-white" />
        </div>

        <h2 className="mt-8 text-3xl font-bold text-slate-800">
          No Pending Bills
        </h2>

        <p className="mt-3 text-slate-500">All bills are already generated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {safeRows.map((row) => (
        <div
          key={row.reading_id}
          className="

group

relative

overflow-hidden

rounded-[34px]

border

border-white/30

bg-white/15

backdrop-blur-3xl

shadow-[0_10px_40px_rgba(15,23,42,.15)]

hover:-translate-y-2

hover:shadow-[0_30px_80px_rgba(6,182,212,.25)]

transition-all

duration-500

"
        >
          {/* Shine */}

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -left-48 top-0 h-full w-32 rotate-12 bg-white/20 blur-2xl transition-all duration-1000 group-hover:left-[120%]" />
          </div>

          {/* Glow */}

          <div className="absolute -top-24 -right-20 h-60 w-60 rounded-full bg-cyan-400/20 blur-[90px]" />

          <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-violet-400/20 blur-[90px]" />

          {/* Header */}

          <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 p-6 border-b border-white/20 bg-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl">
                  <User size={28} />
                </div>

                <div className="absolute inset-0 rounded-full bg-cyan-400 blur-xl opacity-30"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {row.customer_name}
                </h2>

                <p className="mt-1 text-slate-500">
                  Consumer No :
                  <span className="font-semibold ml-2">{row.consumer_no}</span>
                </p>
              </div>
            </div>

            {row.bill_id ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/20 px-5 py-2 backdrop-blur-xl">
                <CheckCircle2 size={18} className="text-emerald-600" />

                <span className="font-semibold text-emerald-700">
                  Generated
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-300/20 px-5 py-2 backdrop-blur-xl">
                <Clock3 size={18} className="text-yellow-700" />

                <span className="font-semibold text-yellow-800">Pending</span>
              </div>
            )}
          </div>

          {/* Information Section Starts */}

          <div className="relative p-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Reading ID */}

              <div
                className="
      rounded-3xl
      bg-white/20
      backdrop-blur-xl
      border
      border-white/30
      p-5
      hover:bg-white/30
      hover:scale-[1.03]
      transition-all
      duration-300
      "
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <Hash size={18} />

                  <span className="text-sm">Reading ID</span>
                </div>

                <div className="mt-4 text-3xl font-bold text-slate-800">
                  {row.reading_id}
                </div>
              </div>

              {/* Units */}

              <div
                className="
      rounded-3xl
      bg-cyan-50/70
      backdrop-blur-xl
      border
      border-cyan-200
      p-5
      hover:scale-[1.03]
      transition-all
      duration-300
      "
              >
                <div className="flex items-center gap-2 text-cyan-700">
                  <Droplets size={18} />

                  <span className="text-sm">Units</span>
                </div>

                <div className="mt-4 text-3xl font-bold text-cyan-700">
                  {row.units}
                </div>

                <div className="text-sm text-slate-500 mt-1">Litres</div>
              </div>

              {/* Bill No */}

              <div
                className="
      rounded-3xl
      bg-indigo-50/70
      backdrop-blur-xl
      border
      border-indigo-200
      p-5
      hover:scale-[1.03]
      transition-all
      duration-300
      "
              >
                <div className="flex items-center gap-2 text-indigo-600">
                  <FileText size={18} />

                  <span className="text-sm">Bill Number</span>
                </div>

                <div className="mt-4 text-2xl font-bold text-indigo-700 truncate">
                  {row.bill_no ?? "--"}
                </div>
              </div>

              {/* Consumer */}

              <div
                className="
      rounded-3xl
      bg-emerald-50/70
      backdrop-blur-xl
      border
      border-emerald-200
      p-5
      hover:scale-[1.03]
      transition-all
      duration-300
      "
              >
                <div className="flex items-center gap-2 text-emerald-700">
                  <User size={18} />

                  <span className="text-sm">Consumer</span>
                </div>

                <div className="mt-4 text-2xl font-bold text-emerald-700">
                  {row.consumer_no}
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="mt-6 flex items-center justify-between text-sm text-slate-500 border-t border-white/20 pt-5">
              <span>Water Billing System</span>

              <span>
                {row.bill_id ? "Bill Generated" : "Waiting for Generation"}
              </span>
            </div>

            {/* Action Buttons */}

            <div className="mt-6">
              {row.bill_id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* View */}

                  <button
                    onClick={() => onView?.(row.bill_id)}
                    className="
            group
            relative
            overflow-hidden

            rounded-2xl

            bg-gradient-to-r
            from-emerald-500
            to-green-600

            text-white

            shadow-xl

            hover:shadow-emerald-500/40
            hover:-translate-y-1

            transition-all
            duration-300

            py-4
            "
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

                    <div className="relative flex items-center justify-center gap-3">
                      <Eye
                        size={22}
                        className="group-hover:scale-110 transition-transform"
                      />

                      <span className="font-semibold">View Bill</span>
                    </div>
                  </button>

                  {/* Print */}

                  <button
                    onClick={() => onThermal?.(row.bill_id)}
                    className="
            group
            relative
            overflow-hidden

            rounded-2xl

            bg-gradient-to-r
            from-orange-500
            to-amber-600

            text-white

            shadow-xl

            hover:shadow-orange-500/40
            hover:-translate-y-1

            transition-all
            duration-300

            py-4
            "
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

                    <div className="relative flex items-center justify-center gap-3">
                      <Printer
                        size={22}
                        className="group-hover:rotate-12 transition-transform"
                      />

                      <span className="font-semibold">Thermal Print</span>
                    </div>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onGenerate(row)}
                  className="
          group
          relative
          overflow-hidden

          w-full

          rounded-2xl

          bg-gradient-to-r

          from-cyan-500
          via-sky-500
          to-indigo-600

          text-white

          shadow-2xl

          hover:shadow-cyan-500/40
          hover:-translate-y-1

          transition-all
          duration-300

          py-5
          "
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

                  <div className="relative flex items-center justify-center gap-3">
                    <FilePlus
                      size={24}
                      className="group-hover:rotate-90 transition-transform duration-300"
                    />

                    <span className="font-bold text-lg tracking-wide">
                      Generate Bill
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
