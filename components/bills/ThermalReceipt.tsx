"use client";

import Image from "next/image";
import QRCode from "react-qr-code";

interface Props {
  bill: any;
}

export default function ThermalReceipt({ bill }: Props) {
  const info = bill.bill;
  const details = bill.details ?? [];
  const funds = bill.funds ?? [];

  const format = (value: any) =>
    Number(value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        py-8
        flex
        justify-center
        print:bg-white
        print:p-0
      "
    >
      <div
        className="
          w-[302px]
          bg-white
          text-black
          shadow-2xl
          rounded-lg
          print:w-[302px]
          print:shadow-none
          print:rounded-none
        "
      >
        {/* HEADER */}

        <div
          className="
            text-center
            p-5
            border-b-2
            border-dashed
          "
        >
          <Image
            src="/icons/64x64.png"
            width={55}
            height={55}
            alt="Gramasira Logo"
            className="mx-auto rounded-xl"
          />

          <h1 className="text-xl font-bold mt-2">GRAMASIRA</h1>

          <div className="text-sm">Water Supply Scheme</div>

          <div className="text-xs text-gray-500 mt-1">
            Computer Generated Receipt
          </div>
        </div>

        {/* BILL DETAILS */}

        <div className="p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Bill No</span>
            <strong>{info.bill_no}</strong>
          </div>

          <div className="flex justify-between">
            <span>Consumer</span>
            <strong>{info.consumer_no}</strong>
          </div>

          <div className="flex justify-between">
            <span>Name</span>
            <strong>{info.customer_name}</strong>
          </div>

          <div className="flex justify-between">
            <span>Month</span>
            <strong>{info.bill_month}</strong>
          </div>
        </div>

        <div className="border-t border-dashed" />

        {/* READING */}

        <div className="p-4">
          <div className="font-bold mb-3">Meter Reading</div>

          <div className="grid grid-cols-3 text-center">
            <div>
              <div className="text-xs text-gray-500">Previous</div>

              <b>{format(info.previous_reading)}</b>
            </div>

            <div>
              <div className="text-xs text-gray-500">Current</div>

              <b>{format(info.current_reading)}</b>
            </div>

            <div>
              <div className="text-xs text-gray-500">Units</div>

              <b>{format(info.units)}</b>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed" />

        {/* SLAB DETAILS */}

        <div className="p-4">
          <div className="font-bold mb-3">Consumption Charges</div>

          {details.map((item: any, index: number) => (
            <div key={index} className="mb-2 border-b border-dashed pb-2">
              <div className="text-xs text-gray-500">
                {item.slab_from}-{item.slab_to} Litres
              </div>

              <div className="flex justify-between">
                <span>
                  {format(item.units)}× ₹{format(item.rate)}
                </span>

                <b>₹{format(item.amount)}</b>
              </div>
            </div>
          ))}
        </div>

        {/* FUNDS */}

        {funds.length > 0 && (
          <div className="p-4 border-t border-dashed">
            <b>Additional Funds</b>

            {funds.map((item: any, index: number) => (
              <div key={index} className="flex justify-between mt-2">
                <span>{item.fund_name}</span>

                <b>₹{format(item.amount)}</b>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed" />

        {/* TOTAL */}

        <div className="p-4 space-y-2">
          {[
            ["Water Charge", info.water_charge],
            ["Fixed Charge", info.fixed_charge],
            ["Meter Charge", info.meter_charge],
            ["Maintenance", info.maintenance_charge],
            ["Penalty", info.penalty],
            ["Discount", info.discount],
          ].map((row: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span>{row[0]}</span>

              <b>₹{format(row[1])}</b>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-black" />

        <div className="p-5">
          <div
            className="
              flex
              justify-between
              text-xl
              font-bold
            "
          >
            <span>TOTAL</span>

            <span>₹{format(info.total_amount)}</span>
          </div>

          <div className="text-xs mt-2">Due Date : {info.due_date}</div>
        </div>

        <div className="border-t border-dashed" />

        {/* QR */}

        <div className="p-5 text-center">
          <QRCode value={info.qr_string || ""} size={140} />

          <div className="mt-3 text-xs font-semibold">Scan & Pay using UPI</div>
        </div>

        <div className="border-t border-dashed" />

        <div className="p-5 text-center">
          <div>Thank You</div>

          <b>Gramasira Water Supply</b>

          <button
            onClick={() => window.print()}
            className="
              mt-5
              w-full
              bg-blue-600
              text-white
              py-3
              rounded-xl
              print:hidden
            "
          >
            🖨 Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
