"use client";

import { useEffect, useState } from "react";

import billService from "@/services/bill.service";

import BillCharges from "./BillCharges";
import BillFunds from "./BillFunds";
import BillSummary from "./BillSummary";
import BillActions from "./BillActions";
import SharePdfButton from "./SharePdfButton";

interface Props {
  billId: number;
}

export default function BillPreview({ billId }: Props) {
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState<any>(null);

  useEffect(() => {
    if (billId) {
      loadBill();
    }
  }, [billId]);

  async function loadBill() {
    try {
      setLoading(true);

      const data = await billService.getBill(billId);

      console.log("Bill Data", data);

      setBill(data);
    } catch (err) {
      console.error("Bill Load Error:", err);
      setBill(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading Bill...</div>;
  }

  if (!bill || !bill.bill) {
    return <div className="p-10 text-center text-red-600">Bill not found.</div>;
  }

  const status = bill.bill.status?.toString().toLowerCase() || "pending";

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6">
      {/* PDF AREA START */}

      <div
        id="bill-preview"
        className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 overflow-hidden"
      >
        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Water Bill
            </h1>

            <p className="text-gray-500 mt-1">Bill Preview</p>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              status === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {bill.bill.status}
          </span>
        </div>

        {/* Customer Details */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <strong>Bill No</strong>
            <div>{bill.bill.bill_no}</div>
          </div>

          <div>
            <strong>Consumer No</strong>
            <div>{bill.bill.consumer_no}</div>
          </div>

          <div>
            <strong>Customer</strong>
            <div>{bill.bill.customer_name}</div>
          </div>

          <div>
            <strong>Mobile</strong>
            <div>{bill.bill.mobile}</div>
          </div>

          <div className="col-span-2">
            <strong>Address</strong>

            <div>
              {bill.bill.address1 && (
                <>
                  {bill.bill.address1}
                  <br />
                </>
              )}

              {bill.bill.address2 && (
                <>
                  {bill.bill.address2}
                  <br />
                </>
              )}

              {bill.bill.address3 && (
                <>
                  {bill.bill.address3}
                  <br />
                </>
              )}
            </div>
          </div>
        </div>

        <hr className="my-8" />

        {/* Charges */}

        <BillCharges details={bill.details || []} />

        {/* Funds */}

        <BillFunds funds={bill.funds || []} />

        {/* Summary */}

        <BillSummary bill={bill.bill} funds={bill.funds || []} />
      </div>

      {/* PDF AREA END */}

      {/* ACTION BUTTONS OUTSIDE PDF */}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <BillActions billId={bill.bill.bill_id} bill={bill} />
      </div>
    </div>
  );
}
