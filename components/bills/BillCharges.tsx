interface Props {
  details: any[];
}

export default function BillCharges({ details }: Props) {
  return (
    <>
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
          {details.map((row: any) => (
            <tr key={row.detail_id} className="border-t">
              <td className="p-2">{row.slab_from}</td>

              <td>{row.slab_to}</td>

              <td>{row.units}</td>

              <td>₹ {row.rate}</td>

              <td>₹ {row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
