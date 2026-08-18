"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import billService from "@/services/bill.service";
import printerService from "@/services/printer.service";

import BillCharges from "./BillCharges";
import BillFunds from "./BillFunds";
import BillSummary from "./BillSummary";
import BillActions from "./BillActions";

interface Props {
  billId: number;
}

export default function BillPreview({ billId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState<any>(null);

  /* =========================================================
     LOAD BILL
  ========================================================= */

  useEffect(() => {
    if (billId) {
      loadBill();
    }
  }, [billId]);

  async function loadBill() {
    try {
      setLoading(true);

      const data = await billService.getBill(billId);

      console.log("Bill Data:", data);

      setBill(data);
    } catch (err) {
      console.error("Bill Load Error:", err);

      setBill(null);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     THERMAL PRINT
     SAME LOGIC AS ThermalReceipt.tsx
  ========================================================= */

  async function handleThermalPrint() {
    try {
      if (!bill || !bill.bill) {
        alert("Bill information is not available.");
        return;
      }

      const info = bill.bill;

      const details = bill.details ?? [];

      const funds = bill.funds ?? [];

      /* =====================================================
         PREPARE PRINT DATA
      ===================================================== */

      const printData = {
        billNo: info.bill_no ?? "",
        consumerNo: info.consumer_no ?? "",
        customerName: info.customer_name ?? "",
        billMonth: info.bill_month ?? "",

        previousReading: info.previous_reading ?? 0,
        currentReading: info.current_reading ?? 0,
        units: info.units ?? 0,

        waterCharge: info.water_charge ?? 0,
        fixedCharge: info.fixed_charge ?? 0,
        meterCharge: info.meter_charge ?? 0,
        maintenanceCharge: info.maintenance_charge ?? 0,
        penalty: info.penalty ?? 0,
        discount: info.discount ?? 0,

        totalAmount: info.total_amount ?? 0,

        dueDate: info.due_date ?? "",

        qrString: info.qr_string ?? "",

        details: details.map((item: any) => ({
          slab_from: item.slab_from ?? "",
          slab_to: item.slab_to ?? "",
          units: item.units ?? 0,
          rate: item.rate ?? 0,
          amount: item.amount ?? 0,
        })),

        funds: funds.map((item: any) => ({
          fund_name: item.fund_name ?? "",
          amount: item.amount ?? 0,
        })),
      };

      console.log("THERMAL PRINT DATA:", printData);

      /* =====================================================
         CHECK WEB BLUETOOTH
      ===================================================== */

      if (typeof navigator === "undefined" || !(navigator as any).bluetooth) {
        alert(
          "Web Bluetooth is not supported in this browser.\n\n" +
            "Please use Chrome on Android.",
        );

        return;
      }

      /* =====================================================
         CONNECT PRINTER
         
         If already connected:
         no pairing dialog.

         If not connected:
         Bluetooth printer selector opens.
      ===================================================== */

      if (!printerService.isConnected()) {
        console.log("Printer not connected. Opening Bluetooth selector...");

        await printerService.connect();
      }

      /* =====================================================
         CHECK CONNECTION
      ===================================================== */

      if (!printerService.isConnected()) {
        throw new Error("Thermal printer is not connected.");
      }

      /* =====================================================
         PRINT
      ===================================================== */

      console.log("Sending bill to thermal printer...");

      await printerService.printBill(printData);

      alert("Receipt sent to thermal printer successfully.");
    } catch (error: any) {
      console.error("THERMAL PRINT ERROR:", error);

      alert(
        "Thermal printer error:\n\n" +
          (error?.message || "Unable to print receipt."),
      );
    }
  }

  /* =========================================================
     A4 PRINT
  ========================================================= */

  function handleA4Print() {
    if (!bill?.bill?.bill_id) {
      alert("Bill information is not available.");
      return;
    }

    router.push(`/bills/print/${bill.bill.bill_id}`);
  }

  /* =========================================================
     THERMAL PREVIEW
     
     Optional button if you still want to see the
     formatted thermal receipt.
  ========================================================= */

  function handleThermalPreview() {
    if (!bill?.bill?.bill_id) {
      alert("Bill information is not available.");
      return;
    }

    router.push(`/bills/thermal/${bill.bill.bill_id}`);
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading Bill...</div>;
  }

  /* =========================================================
     BILL NOT FOUND
  ========================================================= */

  if (!bill || !bill.bill) {
    return <div className="p-10 text-center text-red-600">Bill not found.</div>;
  }

  const status = bill.bill.status?.toString().toLowerCase() || "pending";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6">
      {/* =====================================================
          BILL PREVIEW
      ===================================================== */}

      <div
        id="bill-preview"
        className="
          bg-white
          rounded-xl
          shadow-lg
          p-4
          sm:p-6
          md:p-8
          overflow-hidden
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:justify-between
            sm:items-center
            gap-3
            mb-6
          "
        >
          <div>
            <h1
              className="
                text-xl
                sm:text-2xl
                md:text-3xl
                font-bold
              "
            >
              Water Bill
            </h1>

            <p className="text-gray-500 mt-1">Bill Preview</p>
          </div>

          <span
            className={`
              px-4
              py-2
              rounded-full
              text-sm
              font-semibold
              ${
                status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }
            `}
          >
            {bill.bill.status}
          </span>
        </div>

        {/* =================================================
            CUSTOMER DETAILS
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
            sm:gap-6
          "
        >
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

        {/* =================================================
            CHARGES
        ================================================= */}

        <BillCharges details={bill.details || []} />

        {/* =================================================
            FUNDS
        ================================================= */}

        <BillFunds funds={bill.funds || []} />

        {/* =================================================
            SUMMARY
        ================================================= */}

        <BillSummary bill={bill.bill} funds={bill.funds || []} />
      </div>

      {/* =====================================================
          ACTION BUTTONS
      ===================================================== */}

      <div
        className="
          mt-6
          flex
          flex-col
          sm:flex-row
          gap-3
          print:hidden
        "
      >
        {/* Existing Actions */}

        <BillActions billId={bill.bill.bill_id} bill={bill} />

        {/* =================================================
            DIRECT THERMAL PRINT
        ================================================= */}

        <button
          type="button"
          onClick={handleThermalPrint}
          className="
            flex-1
            bg-blue-600
            hover:bg-blue-700
            active:bg-blue-800
            text-white
            font-semibold
            px-5
            py-3
            rounded-xl
            shadow
            transition
          "
        >
          📱 Print to Thermal Printer
        </button>

        {/* =================================================
            THERMAL PREVIEW
        ================================================= */}

        <button
          type="button"
          onClick={handleThermalPreview}
          className="
            flex-1
            bg-indigo-600
            hover:bg-indigo-700
            active:bg-indigo-800
            text-white
            font-semibold
            px-5
            py-3
            rounded-xl
            shadow
            transition
          "
        >
          👁️ Thermal Preview
        </button>

        {/* =================================================
            A4 PRINT
        ================================================= */}

        <button
          type="button"
          onClick={handleA4Print}
          className="
            flex-1
            bg-gray-700
            hover:bg-gray-800
            active:bg-gray-900
            text-white
            font-semibold
            px-5
            py-3
            rounded-xl
            shadow
            transition
          "
        >
          📄 A4 Print
        </button>
      </div>
    </div>
  );
}
