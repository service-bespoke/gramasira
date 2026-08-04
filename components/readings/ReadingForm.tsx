"use client";

import { UserSearch, Gauge, Droplets, Save } from "lucide-react";
import { Customer } from "@/types/customer";
import CustomerSearch from "./CustomerSearch";

interface Props {
  customers: Customer[];

  customerId: number;
  setCustomerId: (id: number) => void;

  previousReading: number;

  currentReading: number | "";
  setCurrentReading: (value: number | "") => void;

  save: () => void;
}

export default function ReadingForm({
  customers,
  customerId,
  setCustomerId,
  previousReading,
  currentReading,
  setCurrentReading,
  save,
}: Props) {
  const units =
    currentReading === "" ? 0 : Math.max(0, currentReading - previousReading);

  return (
    <div
      className="
        rounded-3xl
        bg-white/70
        backdrop-blur-xl
        border
        border-white/40
        shadow-xl
        p-6
      "
    >
      {/* Header */}

      <div className="flex items-center gap-3 mb-6">
        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-gradient-to-br
            from-sky-500
            to-cyan-500
            text-white
            flex
            items-center
            justify-center
            shadow-lg
          "
        >
          <Droplets size={26} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800">Meter Reading</h2>
          <p className="text-sm text-slate-500">
            Enter the latest water meter reading
          </p>
        </div>
      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        "
      >
        {/* Customer */}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <UserSearch size={18} />
            Customer
          </label>

          <div className="bg-white rounded-xl border shadow-sm">
            <CustomerSearch
              customers={customers}
              value={customerId}
              onChange={setCustomerId}
            />
          </div>
        </div>

        {/* Previous Reading */}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Gauge size={18} />
            Previous Reading
          </label>

          <input
            readOnly
            value={previousReading}
            className="
              w-full
              rounded-xl
              border
              bg-gray-100
              p-3
              font-semibold
              text-gray-700
            "
          />
        </div>

        {/* Current Reading */}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Droplets size={18} />
            Current Reading
          </label>

          <input
            type="number"
            placeholder="Enter Current Reading"
            value={currentReading}
            onChange={(e) =>
              setCurrentReading(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="
              w-full
              rounded-xl
              border
              p-3
              outline-none
              focus:ring-2
              focus:ring-sky-400
            "
          />
        </div>

        {/* Consumed Units */}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Gauge size={18} />
            Consumed Units
          </label>

          <div
            className="
              rounded-xl
              border
              bg-gradient-to-r
              from-sky-50
              to-cyan-50
              p-3
              font-bold
              text-sky-700
            "
          >
            {currentReading === ""
              ? "-- Litres"
              : `${units.toLocaleString()} Litres`}
          </div>
        </div>
      </div>

      {/* Save Button */}

      <button
        onClick={save}
        className="
          mt-8
          flex
          items-center
          justify-center
          gap-2
          w-full
          md:w-auto
          px-8
          py-3
          rounded-2xl
          bg-gradient-to-r
          from-sky-600
          to-cyan-500
          text-white
          font-semibold
          shadow-lg
          hover:scale-105
          transition-all
        "
      >
        <Save size={20} />
        Save Reading
      </button>
    </div>
  );
}
