"use client";

import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  preview: any;
  funds: any[];
  onGenerate: (funds: number[]) => Promise<boolean>;
}

export default function BillPreviewDialog({
  open,
  onClose,
  preview,
  funds,
  onGenerate,
}: Props) {
  const [selectedFunds, setSelectedFunds] = useState<number[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedFunds([]);
    }
  }, [open]);

  if (!open || !preview) return null;
  console.log("PREVIEW OBJECT", preview);
  const reading = preview.reading ?? {};

  const slabs = preview.details ?? [];

  const waterCharge = Number(preview.water_charge ?? 0);
  const fixedCharge = Number(preview.fixed_charge ?? 0);
  const meterCharge = Number(preview.meter_charge ?? 0);
  const maintenanceCharge = Number(preview.maintenance_charge ?? 0);
  const arrears = Number(preview.arrears ?? 0);
  const penalty = Number(preview.penalty ?? 0);

  const uniqueFunds = funds.filter(
    (fund: any, index: number, self: any[]) =>
      index ===
      self.findIndex(
        (f) =>
          f.fund_name === fund.fund_name &&
          Number(f.fund_rate) === Number(fund.fund_rate),
      ),
  );

  function toggleFund(id: number) {
    if (selectedFunds.includes(id)) {
      setSelectedFunds(selectedFunds.filter((x) => x !== id));
    } else {
      setSelectedFunds([...selectedFunds, id]);
    }
  }
  const fundAmount = uniqueFunds
    .filter((f: any) => selectedFunds.includes(Number(f.id)))
    .reduce((sum: number, f: any) => sum + Number(f.fund_rate ?? 0), 0);

  const grandTotal =
    waterCharge +
    fixedCharge +
    meterCharge +
    maintenanceCharge +
    arrears +
    penalty +
    fundAmount;
  async function generate() {
    setGenerating(true);

    const ok = await onGenerate(selectedFunds);

    setGenerating(false);

    if (ok) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
      <div className="max-w-5xl mx-auto bg-white rounded-xl mt-10 mb-10 p-8">
        <h1 className="text-3xl font-bold mb-6">Bill Preview</h1>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <strong>Consumer No</strong>

            <div>{reading.consumer_no}</div>
          </div>

          <div>
            <strong>Bill Month</strong>

            <div>{reading.billing_month}</div>
          </div>

          <div>
            <strong>Customer</strong>

            <div>{reading.customer_name}</div>
          </div>

          <div>
            <strong>Mobile</strong>

            <div>{reading.mobile}</div>
          </div>

          <div className="col-span-2">
            <strong>Address</strong>

            <div>
              {reading.address1}
              <br />
              {reading.address2}
              <br />
              {reading.address3}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <strong>Previous</strong>

            <div>{reading.previous_reading}</div>
          </div>

          <div>
            <strong>Current</strong>

            <div>{reading.current_reading}</div>
          </div>

          <div>
            <strong>Units</strong>

            <div>{reading.units}</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-3">Water Charge Calculation</h2>

        <table className="w-full border mb-8">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">From</th>

              <th>To</th>

              <th>Units</th>

              <th>Rate</th>

              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {slabs.map((row: any, index: number) => (
              <tr
                key={`${row.slab_from}-${row.slab_to}-${row.units}-${index}`}
                className="border-t"
              >
                <td className="p-2">{row.slab_from}</td>

                <td>{row.slab_to}</td>

                <td>{row.units}</td>

                <td>₹ {row.rate}</td>

                <td>₹ {row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-xl font-semibold mb-3">Additional Funds</h2>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {uniqueFunds.map((fund: any) => (
            <label
              key={fund.id}
              className="flex items-center gap-3 border rounded-lg p-3"
            >
              <input
                type="checkbox"
                checked={selectedFunds.includes(Number(fund.id))}
                onChange={() => toggleFund(Number(fund.id))}
              />

              <div>
                <div className="font-semibold">{fund.fund_name}</div>

                <div className="text-sm text-gray-500">
                  ₹ {Number(fund.fund_rate || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="bg-blue-50 rounded-lg p-5 space-y-2">
          <div className="flex justify-between">
            <span>Water Charge</span>
            <strong>₹ {waterCharge.toLocaleString("en-IN")}</strong>
          </div>

          <div className="flex justify-between">
            <span>Fixed Charge</span>
            <strong>₹ {fixedCharge.toLocaleString("en-IN")}</strong>
          </div>

          <div className="flex justify-between">
            <span>Meter Charge</span>
            <strong>₹ {meterCharge.toLocaleString("en-IN")}</strong>
          </div>

          <div className="flex justify-between">
            <span>Maintenance Charge</span>
            <strong>₹ {maintenanceCharge.toLocaleString("en-IN")}</strong>
          </div>

          <div className="flex justify-between">
            <span>Arrears</span>
            <strong>₹ {arrears.toLocaleString("en-IN")}</strong>
          </div>

          <div className="flex justify-between">
            <span>Penalty</span>
            <strong>₹ {penalty.toLocaleString("en-IN")}</strong>
          </div>

          <div className="flex justify-between">
            <span>Selected Funds</span>
            <strong>₹ {fundAmount.toLocaleString("en-IN")}</strong>
          </div>

          <hr />

          <div className="flex justify-between text-2xl font-bold text-blue-700">
            <span>Grand Total</span>
            <span>₹ {grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg"
          >
            Cancel
          </button>

          <button
            disabled={generating}
            onClick={generate}
            className="px-6 py-3 bg-green-700 text-white rounded-lg"
          >
            {generating ? "Generating..." : "Generate Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}
