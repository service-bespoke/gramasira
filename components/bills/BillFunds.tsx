interface Props {
  funds: any[];
}

export default function BillFunds({ funds }: Props) {
  if (!funds || funds.length === 0) return null;

  return (
    <>
      <h2 className="text-xl font-semibold mb-3">Additional Funds</h2>

      <table className="w-full border mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Fund Name</th>

            <th className="text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {funds.map((fund: any) => (
            <tr key={fund.id} className="border-t">
              <td className="p-2">{fund.fund_name}</td>

              <td className="text-right pr-3">
                ₹ {Number(fund.amount).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
