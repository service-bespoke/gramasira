interface Props {
  bill: any;
  funds: any[];
}

export default function BillSummary({ bill, funds }: Props) {
  const fundTotal = funds.reduce(
    (sum: number, item: any) => sum + Number(item.amount),
    0,
  );

  const waterCharge = Number(bill.water_charge);

  const total = waterCharge + fundTotal;

  return (
    <div className="bg-blue-50 rounded-lg p-5 mt-6">
      <h2 className="text-xl font-bold mb-4">Bill Summary</h2>

      <div className="flex justify-between py-2">
        <span>Water Charge</span>

        <span>₹ {waterCharge.toLocaleString("en-IN")}</span>
      </div>

      <div className="flex justify-between py-2">
        <span>Additional Funds</span>

        <span>₹ {fundTotal.toLocaleString("en-IN")}</span>
      </div>

      <hr className="my-3" />

      <div className="flex justify-between text-2xl font-bold text-blue-700">
        <span>Total Amount</span>

        <span>₹ {total.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
