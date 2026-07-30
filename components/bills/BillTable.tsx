"use client";

import { Eye, Printer, FilePlus, ReceiptText } from "lucide-react";

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

  onA4,
}: Props) {
  if (loading) {
    return (
      <div
        className="
flex
justify-center
items-center
py-16
text-gray-500
"
      >
        <div className="animate-pulse">Loading bills...</div>
      </div>
    );
  }

  const safeRows = rows ?? [];

  if (safeRows.length === 0) {
    return (
      <div
        className="
rounded-3xl
bg-white/70
backdrop-blur-xl
shadow-xl
p-10
text-center
text-gray-500
"
      >
        <ReceiptText size={45} className="mx-auto mb-3 text-sky-500" />
        No pending bills found
      </div>
    );
  }

  return (
    <div
      className="
rounded-3xl
bg-white/70
backdrop-blur-xl
border
border-white/40
shadow-xl
overflow-hidden
"
    >
      <div className="p-5 flex items-center gap-3"></div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="
bg-gradient-to-r
from-sky-600
to-cyan-500
text-white
"
            >
              <th className="p-4 text-left">Consumer No</th>

              <th className="p-4 text-left">Customer</th>

              <th className="p-4 text-center">Units</th>

              <th className="p-4 text-center">Status</th>

              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {safeRows.map((row) => (
              <tr
                key={row.reading_id}
                className="
border-b
hover:bg-sky-50
transition
"
              >
                <td className="p-4 font-medium">{row.consumer_no}</td>

                <td className="p-4">
                  <div className="font-semibold text-gray-800">
                    {row.customer_name}
                  </div>

                  <div className="text-xs text-gray-500">
                    Reading ID : {row.reading_id}
                  </div>
                </td>

                <td className="p-4 text-center">
                  <span
                    className="
px-3
py-1
rounded-full
bg-cyan-100
text-cyan-700
font-semibold
text-sm
"
                  >
                    {row.units} Ltr
                  </span>
                </td>

                <td className="p-4 text-center">
                  {row.bill_id ? (
                    <span
                      className="
px-3
py-1
rounded-full
bg-green-100
text-green-700
text-sm
font-semibold
"
                    >
                      Generated
                    </span>
                  ) : (
                    <span
                      className="
px-3
py-1
rounded-full
bg-yellow-100
text-yellow-700
text-sm
font-semibold
"
                    >
                      Pending
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div
                    className="
flex
justify-center
gap-2
"
                  >
                    {row.bill_id ? (
                      <>
                        <button
                          onClick={() => onView?.(row.bill_id)}
                          className="
flex
items-center
gap-1
px-3
py-2
rounded-xl
bg-green-600
text-white
hover:bg-green-700
transition
"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          onClick={() => onThermal?.(row.bill_id)}
                          className="
flex
items-center
gap-1
px-3
py-2
rounded-xl
bg-orange-500
text-white
hover:bg-orange-600
transition
"
                        >
                          <Printer size={16} />
                          Print
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onGenerate(row)}
                        className="
flex
items-center
gap-2
px-4
py-2
rounded-xl

bg-gradient-to-r
from-indigo-600
to-blue-600

text-white

hover:scale-105

transition

"
                      >
                        <FilePlus size={17} />
                        Generate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
