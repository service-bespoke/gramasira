"use client";

import { Customer } from "@/types/customer";

interface Props {
  customers: Customer[];
  loading: boolean;
}

export default function CustomerTable({ customers, loading }: Props) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="p-4 text-left">Customer ID</th>

            <th className="text-left">Consumer No</th>

            <th className="text-left">Customer Name</th>

            <th className="text-left">Mobile</th>

            <th className="text-right">Previous Reading</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="p-8 text-center">
                Loading...
              </td>
            </tr>
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center">
                No Customers Found
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer.customer_id}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-4">{customer.customer_id}</td>

                <td>{customer.consumer_no}</td>

                <td>{customer.customer_name}</td>

                <td>{customer.mobile || "-"}</td>

                <td className="text-right pr-4">
                  {Number(customer.previous_reading ?? 0).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
