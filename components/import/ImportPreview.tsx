"use client";

interface Props {
  preview: {
    customers: number;

    tariffs: number;

    bills: number;

    funds: number;
  };

  selected: {
    customers: boolean;

    tariffs: boolean;

    bills: boolean;

    funds: boolean;
  };

  onChange: (name: string) => void;
}

export default function ImportPreview({
  preview,

  selected,

  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-5">Select Sheets to Import</h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Import</th>

            <th className="text-left">Sheet</th>

            <th className="text-left">Records</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <input
                type="checkbox"
                checked={selected.customers}
                onChange={() => onChange("customers")}
              />
            </td>

            <td>Customers</td>

            <td>{preview.customers}</td>
          </tr>

          <tr>
            <td>
              <input
                type="checkbox"
                checked={selected.tariffs}
                onChange={() => onChange("tariffs")}
              />
            </td>

            <td>Tariff Slabs</td>

            <td>{preview.tariffs}</td>
          </tr>

          <tr>
            <td>
              <input
                type="checkbox"
                checked={selected.bills}
                onChange={() => onChange("bills")}
              />
            </td>

            <td>Bill History</td>

            <td>{preview.bills}</td>
          </tr>

          <tr>
            <td>
              <input
                type="checkbox"
                checked={selected.funds}
                onChange={() => onChange("funds")}
              />
            </td>

            <td>Additional Funds</td>

            <td>{preview.funds}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
