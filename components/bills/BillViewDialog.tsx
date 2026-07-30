"use client";

interface Props {
  open: boolean;
  bill: any;
  onClose: () => void;
}

export default function BillViewDialog({ open, bill, onClose }: Props) {
  if (!open || !bill) return null;

  // Total of all additional funds
  const additionalCharge =
    bill?.funds?.reduce(
      (sum: number, fund: any) => sum + Number(fund.amount),
      0,
    ) || 0;

  // Final Total
  const grandTotal = Number(bill?.bill?.total_amount || 0) + additionalCharge;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[700px] p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-5">Bill Details</h2>

        <table className="w-full">
          <tbody>
            <tr>
              <td className="py-1 font-semibold">Bill No</td>
              <td>{bill.bill.bill_no}</td>
            </tr>

            <tr>
              <td className="py-1 font-semibold">Customer</td>
              <td>{bill.bill.customer_name}</td>
            </tr>

            <tr>
              <td className="py-1 font-semibold">Units</td>
              <td>{Number(bill.bill.units).toLocaleString()} Litres</td>
            </tr>

            <tr>
              <td className="py-1 font-semibold">Water Charge</td>
              <td>₹ {Number(bill.bill.water_charge).toFixed(2)}</td>
            </tr>

            <tr>
              <td className="py-1 font-semibold">Additional Charge</td>
              <td>₹ {additionalCharge.toFixed(2)}</td>
            </tr>

            <tr className="font-bold text-lg">
              <td className="pt-3">Total</td>
              <td className="pt-3">₹ {grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {bill.funds && bill.funds.length > 0 && (
          <>
            <hr className="my-5" />

            <h3 className="text-lg font-semibold mb-3">Additional Funds</h3>

            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Fund</th>
                  <th className="border p-2 text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {bill.funds.map((fund: any) => (
                  <tr key={fund.id}>
                    <td className="border p-2">{fund.fund_name}</td>

                    <td className="border p-2 text-right">
                      ₹ {Number(fund.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
