"use client";

import { useState } from "react";
import billService from "@/services/bill.service";

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  function exportExcel() {
    if (!fromDate || !toDate) {
      alert("Please select From Date and To Date");
      return;
    }

    billService.exportExcel(fromDate, toDate);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bill History Report</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium">From Date</label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded w-full p-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">To Date</label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded w-full p-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
