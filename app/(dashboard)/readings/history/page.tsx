"use client";

import { useEffect, useState } from "react";

import {
  getPendingReadings,
  deleteReading,
} from "@/offline/reading";

import { MeterReading } from "@/offline/db";

export default function PendingReadingsPage() {
  const [rows, setRows] = useState<MeterReading[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getPendingReadings();
    setRows(data);
  }

  async function remove(id?: number) {
    if (!id) return;

    if (!confirm("Delete this reading?")) return;

    await deleteReading(id);

    loadData();
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">

      <h1 className="text-2xl font-bold mb-6">
        Pending Offline Readings
      </h1>

      {rows.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No Pending Readings
        </div>
      ) : (
        <table className="w-full border">

          <thead className="bg-blue-700 text-white">

            <tr>

              <th className="p-2">Consumer</th>

              <th className="p-2">Customer</th>

              <th className="p-2">Previous</th>

              <th className="p-2">Current</th>

              <th className="p-2">Units</th>

              <th className="p-2">Date</th>

              <th className="p-2">Action</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((r) => (

              <tr key={r.id} className="border-b">

                <td className="p-2">{r.consumer_no}</td>

                <td>{r.customer_name}</td>

                <td>{r.previous_reading}</td>

                <td>{r.current_reading}</td>

                <td>{r.units}</td>

                <td>{new Date(r.captured_at).toLocaleString()}</td>

                <td>

                  <button
                    onClick={() => remove(r.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      )}

    </div>
  );
}