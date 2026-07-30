"use client";

import { UserSearch, Gauge, Droplets, Save } from "lucide-react";

import { Customer } from "@/types/customer";
import CustomerSearch from "./CustomerSearch";

interface Props {
  customers: Customer[];

  customerId: number;

  setCustomerId: (id: number) => void;

  previousReading: number;

  currentReading: number;

  setCurrentReading: (value: number) => void;

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
  const units = currentReading - previousReading;

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

          <div
            className="
bg-white
rounded-xl
border
shadow-sm
"
          >
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
            className="
w-full
rounded-xl
border
bg-gray-100
p-3
text-gray-700
font-semibold
"
            readOnly
            value={previousReading}
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
            className="
w-full
rounded-xl
border
p-3
focus:ring-2
focus:ring-sky-400
outline-none
"
            value={currentReading}
            onChange={(e) => setCurrentReading(Number(e.target.value))}
          />
        </div>

        {/* Units */}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Gauge size={18} />
            Consumed Units
          </label>

          <div
            className="
rounded-xl
p-3
bg-gradient-to-r
from-sky-50
to-cyan-50
border
font-bold
text-sky-700
"
          >
            {units.toLocaleString()} Litres
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
