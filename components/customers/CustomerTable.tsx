"use client";

import { User, Phone, Droplets, Hash, BadgeCheck } from "lucide-react";

import { Customer } from "@/types/customer";

interface Props {
  customers: Customer[];
  loading: boolean;
}

export default function CustomerTable({ customers, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="
              h-56
              rounded-3xl
              animate-pulse
              bg-white/60
              backdrop-blur-xl
              border
              border-white/40
            "
          />
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div
        className="
          rounded-3xl
          bg-white/70
          backdrop-blur-xl
          border
          border-white/40
          shadow-lg
          p-16
          text-center
        "
      >
        <User className="mx-auto text-slate-300" size={60} />

        <h2 className="mt-4 text-2xl font-bold text-slate-700">
          No Customers Found
        </h2>

        <p className="mt-2 text-slate-500">Customer list is empty.</p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-4
      "
    >
      {customers.map((customer) => (
        <div
          key={customer.customer_id}
          className="
            relative
            overflow-hidden

            rounded-3xl

            bg-white/20
            backdrop-blur-3xl

            border
            border-white/30

            shadow-[0_15px_45px_rgba(0,0,0,0.10)]

            hover:-translate-y-1
            hover:shadow-[0_25px_60px_rgba(0,0,0,0.18)]

            transition-all
            duration-300
          "
        >
          {/* Background Glow */}

          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-cyan-300/20 blur-[70px]" />

          <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-indigo-300/20 blur-[70px]" />

          {/* Header */}

          <div
            className="
              relative
              flex
              items-center
              gap-4
              p-5

              border-b
              border-white/20

              bg-gradient-to-r
              from-white/20
              to-white/5
            "
          >
            <div
              className="
                h-14
                w-14

                rounded-full

                bg-gradient-to-br
                from-sky-500
                to-indigo-600

                text-white

                flex
                items-center
                justify-center

                shadow-lg
              "
            >
              <User size={24} />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-lg text-slate-800 truncate">
                {customer.customer_name}
              </h2>

              <p className="text-sm text-slate-500">#{customer.customer_id}</p>
            </div>
          </div>

          {/* Body */}

          <div className="relative p-5 space-y-4">
            {/* Consumer */}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <BadgeCheck size={16} />
                <span className="text-sm">Consumer No</span>
              </div>

              <span className="font-semibold text-slate-700">
                {customer.consumer_no}
              </span>
            </div>

            {/* Mobile */}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Phone size={16} />
                <span className="text-sm">Mobile</span>
              </div>

              <span className="font-semibold text-slate-700">
                {customer.mobile || "-"}
              </span>
            </div>

            {/* Previous Reading */}

            <div
              className="
                rounded-2xl

                bg-gradient-to-r
                from-sky-50
                to-cyan-50

                border

                p-4
              "
            >
              <div className="flex items-center gap-2 text-sky-600 text-sm">
                <Droplets size={18} />
                Previous Reading
              </div>

              <div className="mt-2 text-3xl font-bold text-sky-700">
                {Number(customer.previous_reading ?? 0).toLocaleString()}
              </div>

              <div className="text-xs text-slate-500 mt-1">Litres</div>
            </div>

            {/* Customer ID */}

            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Hash size={15} />
              Customer ID :
              <span className="font-semibold text-slate-700">
                {customer.customer_id}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
