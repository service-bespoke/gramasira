"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import billService from "@/services/bill.service";
import printerService from "@/services/printer.service";

import BillCharges from "./BillCharges";
import BillFunds from "./BillFunds";
import BillSummary from "./BillSummary";
import SharePdfButton from "./SharePdfButton";

interface Props {
  billId: number;
}

export default function BillPreview({ billId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState<any>(null);
  const [printing, setPrinting] = useState(false);

  /* =========================================================
     FORMAT CREATED DATE

     Input:
       2026-09-11 10:25:30

     Output:
       11/09/26

     This directly extracts the date from the MySQL
     YYYY-MM-DD portion and avoids timezone conversion.
  ========================================================= */

  function formatCreatedDate(value: any) {
    if (!value) return "";

    const dateString = String(value).trim();

    // MySQL DATE / DATETIME
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      const [, year, month, day] = match;

      return `${day}/${month}/${year}`;
    }

    return dateString;
  }

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
     DIRECT THERMAL PRINT
  ========================================================= */

  async function handleThermalPrint() {
    if (printing) return;

    try {
      setPrinting(true);

      console.log("========================================");
      console.log("DIRECT THERMAL PRINT START");
      console.log("Bill ID:", billId);
      console.log("========================================");

      // ---------------------------------------------
      // CHECK BILL
      // ---------------------------------------------

      if (!bill?.bill) {
        throw new Error("Bill information is not available.");
      }

      // ---------------------------------------------
      // LOAD COMPLETE BILL
      // ---------------------------------------------

      console.log("Loading bill data...");

      const billData = await billService.getBill(billId);

      console.log("Complete bill data:", billData);

      if (!billData || !billData.bill) {
        throw new Error("Unable to load bill information.");
      }

      // ---------------------------------------------
      // CHECK PRINTER SERVICE
      // ---------------------------------------------

      console.log("Printer service:", printerService);

      if (!printerService) {
        throw new Error("Printer service is not available.");
      }

      // ---------------------------------------------
      // CHECK BLUETOOTH SUPPORT
      // ---------------------------------------------

      if (
        typeof printerService.isSupported === "function" &&
        !printerService.isSupported()
      ) {
        throw new Error("Web Bluetooth is not supported in this browser.");
      }

      // ---------------------------------------------
      // CONNECT
      // ---------------------------------------------

      if (
        typeof printerService.isConnected === "function" &&
        !printerService.isConnected()
      ) {
        console.log("Printer is not connected.");
        console.log("Opening printer selection...");

        await printerService.connect();

        console.log("Printer connection completed.");
      }

      // ---------------------------------------------
      // VERIFY CONNECTION
      // ---------------------------------------------

      if (
        typeof printerService.isConnected === "function" &&
        !printerService.isConnected()
      ) {
        throw new Error("Printer connection was not established.");
      }

      // ---------------------------------------------
      // PRINT
      // ---------------------------------------------

      console.log("Sending bill to printer...");

      if (typeof printerService.printBill !== "function") {
        throw new Error("printerService.printBill() is not available.");
      }

      await printerService.printBill(billData);

      console.log("========================================");
      console.log("THERMAL PRINT SUCCESS");
      console.log("========================================");

      alert("Receipt printed successfully.");
    } catch (error: any) {
      console.log("========================================");
      console.log("THERMAL PRINT FAILED");
      console.log("========================================");

      console.log("Error object:", error);
      console.log("Error name:", error?.name);
      console.log("Error message:", error?.message);
      console.log("Error code:", error?.code);
      console.log("Error stack:", error?.stack);

      console.log("========================================");

      // ---------------------------------------------
      // USER CANCELLED PRINTER SELECTION
      // ---------------------------------------------

      if (error?.name === "NotFoundError") {
        alert("Printer selection was cancelled.");
        return;
      }

      // ---------------------------------------------
      // DISPLAY REAL ERROR
      // ---------------------------------------------

      const message =
        error?.message || error?.name || "Unable to print receipt.";

      alert("Thermal printer error:\n\n" + message);
    } finally {
      setPrinting(false);
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
     BACK
  ========================================================= */

  function handleBack() {
    router.back();
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

  /* =========================================================
     STATUS
  ========================================================= */

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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Water Bill
            </h1>

            <p className="text-gray-500 mt-1">Bill Preview</p>
          </div>

          {/* =================================================
              CREATED DATE

              Format:
              dd/mm/yy
          ================================================= */}

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
            {formatCreatedDate(bill.bill.created_at)}
          </span>

          {/* =================================================
              STATUS
          ================================================= */}

          {/*
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
          */}
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
        {/* =================================================
            THERMAL PRINT
        ================================================= */}

        <button
          type="button"
          onClick={handleThermalPrint}
          disabled={printing}
          className={`
            flex-1
            text-white
            font-semibold
            px-5
            py-4
            rounded-xl
            shadow-md
            transition
            flex
            items-center
            justify-center
            gap-2
            ${
              printing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }
          `}
        >
          {printing ? (
            <>
              <span className="animate-spin">⏳</span>
              Printing...
            </>
          ) : (
            <>🖨️ Thermal Print</>
          )}
        </button>

        {/* =================================================
            SHARE BILL
        ================================================= */}

        <div className="flex-1">
          <SharePdfButton bill={bill} />
        </div>

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={handleBack}
          className="
            bg-slate-700
            hover:bg-slate-800
            active:bg-slate-900
            text-white
            font-semibold
            px-8
            py-4
            rounded-xl
            shadow-md
            transition
          "
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
