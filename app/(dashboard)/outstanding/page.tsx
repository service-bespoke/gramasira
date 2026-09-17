"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import billService from "@/services/bill.service";
import printerService from "@/services/printer.service";

/* =========================================================
   TYPES
========================================================= */

interface Bill {
  bill_id: number;
  bill_no: string;

  customer_id?: number;
  consumer_no: string;
  customer_name: string;

  bill_month: string;

  previous_reading: number;
  current_reading: number;
  units: number;

  water_charge: number;
  fixed_charge: number;
  meter_charge: number;
  maintenance_charge: number;

  arrears: number;
  discount: number;
  penalty: number;

  total_amount: number;

  due_date: string;
  status: string;
}

interface PaymentResult {
  success?: boolean;
  status?: boolean;
  message?: string;

  bill_id?: number;
  bill_no?: string;

  data?: {
    bill_id?: number;
    bill_no?: string;
    success?: boolean;
    status?: boolean;
    message?: string;
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function OutstandingPage() {
  const router = useRouter();

  const [bills, setBills] = useState<Bill[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const [showPayment, setShowPayment] = useState(false);

  /* =========================================================
     LOAD OUTSTANDING
  ========================================================= */

  async function loadOutstanding() {
    try {
      setLoading(true);

      const response = await billService.getOutstanding(search);

      console.log("Outstanding response:", response);

      let data: unknown = response;

      if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
        const responseObject = response as {
          data?: unknown;
          bills?: unknown;
        };

        data = responseObject.data ?? responseObject.bills ?? [];
      }

      setBills(Array.isArray(data) ? (data as Bill[]) : []);
    } catch (error) {
      console.error("Outstanding load error:", error);

      setBills([]);

      alert("Unable to load outstanding bills.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOutstanding();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  function handleSearch() {
    loadOutstanding();
  }

  /* =========================================================
     OPEN BILL
  ========================================================= */

  function openBill(bill: Bill) {
    setSelectedBill(bill);
  }

  /* =========================================================
     CLOSE BILL
  ========================================================= */

  function closeBill() {
    if (showPayment) {
      return;
    }

    setSelectedBill(null);
  }

  /* =========================================================
     EDIT BILL
  ========================================================= */

  function editBill() {
    if (!selectedBill) {
      return;
    }

    router.push(`/outstanding/edit/${selectedBill.bill_id}`);
  }

  /* =========================================================
     RECEIVE PAYMENT
  ========================================================= */

  function receivePayment() {
    if (!selectedBill) {
      return;
    }

    setShowPayment(true);
  }

  /* =========================================================
     PAYMENT SUCCESS
     
     IMPORTANT:
     
     savePayment() returns the paid bill ID.
     
     Then we reload the complete bill and print it.
     
     This means the thermal receipt contains:
     
     - Paid status
     - Payment date
     - Penalty
     - Final amount
     - QR code
     - Updated bill information
  ========================================================= */

  async function handlePaymentSuccess(result: PaymentResult) {
    try {
      console.log("Payment result:", result);

      /* -------------------------------------------------------
         FIND FINAL BILL ID
      ------------------------------------------------------- */

      const finalBillId = Number(
        result?.bill_id ?? result?.data?.bill_id ?? selectedBill?.bill_id ?? 0,
      );

      if (finalBillId <= 0) {
        throw new Error(
          "Payment was saved, but the final bill ID was not returned.",
        );
      }

      console.log("Final paid bill ID:", finalBillId);

      /* -------------------------------------------------------
         CLOSE PAYMENT MODAL
      ------------------------------------------------------- */

      setShowPayment(false);

      setSelectedBill(null);

      /* -------------------------------------------------------
         LOAD FINAL PAID BILL
         
         IMPORTANT:
         
         Do NOT print the old outstanding bill.
         
         Reload it after payment so that:
         
         penalty
         total_amount
         status
         payment_date
         qr_string
         
         are all current.
      ------------------------------------------------------- */

      console.log("Loading final paid bill...");

      const finalBill = await billService.getBill(finalBillId);

      console.log("Final paid bill:", finalBill);

      if (!finalBill || !finalBill.bill) {
        throw new Error(
          "Payment was saved, but the final bill could not be loaded.",
        );
      }

      /* -------------------------------------------------------
         PRINT FINAL BILL
      ------------------------------------------------------- */

      await printFinalBill(finalBill);

      /* -------------------------------------------------------
         REFRESH OUTSTANDING
         
         Only unpaid bills remain in this list.
      ------------------------------------------------------- */

      await loadOutstanding();
    } catch (error: any) {
      console.error("Post-payment processing error:", error);

      /*
       * IMPORTANT:
       *
       * Payment may already have been saved.
       *
       * Therefore do NOT attempt to save payment again.
       */

      alert(
        error?.message ||
          "Payment was received, but the final bill could not be printed.",
      );

      /*
       * Refresh list anyway because the payment
       * may already have changed the bill to Paid.
       */

      await loadOutstanding();
    }
  }

  /* =========================================================
     PRINT FINAL PAID BILL
  ========================================================= */

  async function printFinalBill(billData: any) {
    try {
      console.log("========================================");

      console.log("FINAL PAID BILL THERMAL PRINT");

      console.log("Bill ID:", billData?.bill?.bill_id);

      console.log("Bill No:", billData?.bill?.bill_no);

      console.log("Status:", billData?.bill?.status);

      console.log("Penalty:", billData?.bill?.penalty);

      console.log("Total:", billData?.bill?.total_amount);

      console.log("QR:", billData?.bill?.qr_string);

      console.log("========================================");

      /* -------------------------------------------------------
         CHECK PRINTER SERVICE
      ------------------------------------------------------- */

      if (!printerService) {
        throw new Error("Printer service is not available.");
      }

      /* -------------------------------------------------------
         CHECK WEB BLUETOOTH
      ------------------------------------------------------- */

      if (
        typeof printerService.isSupported === "function" &&
        !printerService.isSupported()
      ) {
        throw new Error(
          "Web Bluetooth is not supported. Please use Chrome or Edge on Android.",
        );
      }

      /* -------------------------------------------------------
         CONNECT PRINTER
         
         If already connected:
           no pairing dialog.
         
         If not connected:
           Bluetooth selector opens.
      ------------------------------------------------------- */

      if (
        typeof printerService.isConnected === "function" &&
        !printerService.isConnected()
      ) {
        console.log("Thermal printer not connected.");

        console.log("Opening Bluetooth printer selector...");

        await printerService.connect();
      }

      /* -------------------------------------------------------
         VERIFY CONNECTION
      ------------------------------------------------------- */

      if (
        typeof printerService.isConnected === "function" &&
        !printerService.isConnected()
      ) {
        throw new Error("Thermal printer connection was not established.");
      }

      /* -------------------------------------------------------
         CHECK PRINT FUNCTION
      ------------------------------------------------------- */

      if (typeof printerService.printBill !== "function") {
        throw new Error("printerService.printBill() is not available.");
      }

      /* -------------------------------------------------------
         PRINT
         
         Send the COMPLETE final bill.
         
         This is important because the final bill contains
         the QR code and updated paid information.
      ------------------------------------------------------- */

      console.log("Sending final paid bill to thermal printer...");

      await printerService.printBill(billData);

      console.log("Final paid bill printed successfully.");

      alert("Payment received successfully.\n\nFinal bill printed.");
    } catch (error: any) {
      console.error("========================================");

      console.error("THERMAL PRINT ERROR");

      console.error(error);

      console.error("========================================");

      /* -------------------------------------------------------
         USER CANCELLED BLUETOOTH SELECTION
      ------------------------------------------------------- */

      if (
        error?.name === "NotFoundError" ||
        error?.message?.toLowerCase()?.includes("cancel")
      ) {
        throw new Error(
          "Payment was received, but printer selection was cancelled.",
        );
      }

      throw new Error(
        "Payment was received, but thermal printing failed.\n\n" +
          (error?.message || "Unable to print final bill."),
      );
    }
  }

  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  function money(value: number) {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function date(value: string) {
    if (!value) {
      return "-";
    }

    /*
     * Avoid timezone shifting for MySQL dates.
     */

    const valueString = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(valueString)) {
      const parts = valueString.split(/[- :T]/);

      const year = Number(parts[0]);

      const month = Number(parts[1]);

      const day = Number(parts[2]);

      return `${String(day).padStart(2, "0")}/${String(month).padStart(
        2,
        "0",
      )}/${year}`;
    }

    const d = new Date(valueString);

    if (isNaN(d.getTime())) {
      return valueString;
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/20 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading outstanding bills...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 sm:p-5">
      <div className="mx-auto max-w-6xl">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                  <i className="bi bi-wallet2 text-xl" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Outstanding
                  </h1>

                  <p className="text-sm text-slate-500">Unpaid water bills</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-red-500">
                Unpaid Bills
              </div>

              <div className="text-2xl font-bold text-red-700">
                {bills.length}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="mb-5 rounded-3xl border border-white/50 bg-white/70 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search consumer number, name or bill number..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01]"
            >
              <i className="bi bi-search mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* ===================================================
            EMPTY
        =================================================== */}

        {bills.length === 0 && (
          <div className="rounded-3xl border border-white/50 bg-white/70 p-10 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <i className="bi bi-check2-circle text-3xl text-emerald-600" />
            </div>

            <h2 className="text-lg font-bold text-slate-700">
              No Outstanding Bills
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All generated bills are currently paid.
            </p>
          </div>
        )}

        {/* ===================================================
            BILL LIST
        =================================================== */}

        <div className="space-y-3">
          {bills.map((bill) => (
            <button
              key={bill.bill_id}
              type="button"
              onClick={() => openBill(bill)}
              className="w-full rounded-3xl border border-white/60 bg-white/75 p-4 text-left shadow-lg backdrop-blur-xl transition hover:-translate-y-[1px] hover:shadow-xl active:scale-[0.995]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* LEFT */}

                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                      #{bill.bill_no}
                    </span>

                    <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                      UNPAID
                    </span>
                  </div>

                  <h2 className="truncate text-base font-bold text-slate-800">
                    {bill.customer_name}
                  </h2>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      <i className="bi bi-person-badge mr-1" />
                      {bill.consumer_no}
                    </span>

                    <span>
                      <i className="bi bi-calendar3 mr-1" />
                      {date(bill.bill_month)}
                    </span>

                    <span>
                      <i className="bi bi-clock mr-1" />
                      Due {date(bill.due_date)}
                    </span>
                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-500">Amount Due</div>

                    <div className="text-xl font-bold text-red-600">
                      ₹{money(bill.total_amount)}
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <i className="bi bi-chevron-right text-slate-500" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          BILL DETAILS MODAL
      ===================================================== */}

      {selectedBill && !showPayment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-xl sm:rounded-[2rem]">
            {/* HEADER */}

            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Outstanding Bill
                  </div>

                  <h2 className="text-xl font-bold text-slate-800">
                    #{selectedBill.bill_no}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeBill}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5">
              {/* CUSTOMER */}

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Customer
                </div>

                <div className="mt-1 text-lg font-bold text-slate-800">
                  {selectedBill.customer_name}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Consumer No: {selectedBill.consumer_no}
                </div>
              </div>

              {/* READING */}

              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-700">
                  Meter Reading
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <InfoBox
                    label="Previous"
                    value={selectedBill.previous_reading}
                  />

                  <InfoBox
                    label="Current"
                    value={selectedBill.current_reading}
                  />

                  <InfoBox label="Units" value={selectedBill.units} />
                </div>
              </div>

              {/* CHARGES */}

              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-700">
                  Charges
                </h3>

                <div className="space-y-2">
                  <ChargeRow
                    label="Water Charge"
                    value={selectedBill.water_charge}
                  />

                  <ChargeRow
                    label="Fixed Charge"
                    value={selectedBill.fixed_charge}
                  />

                  <ChargeRow
                    label="Meter Charge"
                    value={selectedBill.meter_charge}
                  />

                  <ChargeRow
                    label="Maintenance"
                    value={selectedBill.maintenance_charge}
                  />

                  <ChargeRow label="Arrears" value={selectedBill.arrears} />

                  <ChargeRow label="Discount" value={-selectedBill.discount} />
                </div>
              </div>

              {/* TOTAL */}

              <div className="rounded-3xl bg-gradient-to-r from-red-50 to-orange-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-red-500">
                      Current Payable
                    </div>

                    <div className="mt-1 text-3xl font-bold text-red-700">
                      ₹{money(selectedBill.total_amount)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700">
                    UNPAID
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Due date: {date(selectedBill.due_date)}
                </div>
              </div>

              {/* ACTIONS */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* <button
                  type="button"
                  onClick={editBill}
                  className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  <i className="bi bi-pencil-square mr-2" />
                  Modify Bill
                </button> */}

                <button
                  type="button"
                  onClick={receivePayment}
                  className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 font-semibold text-white shadow-lg"
                >
                  <i className="bi bi-cash-coin mr-2" />
                  Receive Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      {showPayment && selectedBill && (
        <PaymentModal
          bill={selectedBill}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </main>
  );
}

/* =============================================================
   INFO BOX
============================================================= */

function InfoBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-lg font-bold text-slate-700">{value}</div>
    </div>
  );
}

/* =============================================================
   CHARGE ROW
============================================================= */

function ChargeRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-slate-50">
      <span className="text-slate-500">{label}</span>

      <span
        className={
          value < 0
            ? "font-semibold text-emerald-600"
            : "font-semibold text-slate-700"
        }
      >
        ₹{Math.abs(Number(value || 0)).toFixed(2)}
      </span>
    </div>
  );
}

/* =============================================================
   PAYMENT MODAL
============================================================= */

function PaymentModal({
  bill,
  onClose,
  onSuccess,
}: {
  bill: Bill;
  onClose: () => void;
  onSuccess: (result: PaymentResult) => Promise<void>;
}) {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [penalty, setPenalty] = useState(0);

  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [referenceNo, setReferenceNo] = useState("");

  const [remarks, setRemarks] = useState("");

  const [loadingPenalty, setLoadingPenalty] = useState(false);

  const baseAmount = Number(bill.total_amount || 0);

  const finalAmount = baseAmount + Number(penalty || 0);

  /* =========================================================
     LOAD PENALTY
  ========================================================= */

  async function loadPenalty(date: string) {
    try {
      setLoadingPenalty(true);

      const response = await billService.paymentPreview(bill.bill_id, date);

      console.log("Payment preview:", response);

      /*
       * paymentPreview() returns the
       * actual PaymentPreview object.
       */

      const value = response?.penalty ?? 0;

      setPenalty(Number(value || 0));
    } catch (error) {
      console.error("Penalty calculation error:", error);

      setPenalty(0);

      alert("Unable to calculate penalty.");
    } finally {
      setLoadingPenalty(false);
    }
  }

  useEffect(() => {
    loadPenalty(paymentDate);
  }, [paymentDate]);

  /* =========================================================
     SUBMIT PAYMENT
  ========================================================= */

  async function submitPayment() {
    if (loading) {
      return;
    }

    if (loadingPenalty) {
      return;
    }

    if (finalAmount <= 0) {
      alert("Invalid payment amount.");

      return;
    }

    /*
     * UPI and Bank require reference number.
     */

    if (paymentMethod !== "Cash" && !referenceNo.trim()) {
      alert("Please enter the reference number.");

      return;
    }

    try {
      setLoading(true);

      console.log("========================================");

      console.log("SUBMIT FULL PAYMENT");

      console.log("Bill ID:", bill.bill_id);

      console.log("Bill Amount:", baseAmount);

      console.log("Penalty:", penalty);

      console.log("Final Amount:", finalAmount);

      console.log("========================================");

      /* -------------------------------------------------------
         SAVE FULL PAYMENT
      ------------------------------------------------------- */

      const result = await billService.savePayment({
        bill_id: bill.bill_id,

        payment_date: paymentDate,

        /*
         * Full payment only.
         */

        amount: Number(finalAmount.toFixed(2)),

        payment_method: paymentMethod,

        reference_no: referenceNo.trim(),

        remarks: remarks.trim(),
      });

      console.log("savePayment result:", result);

      /*
       * Do NOT close and refresh here.
       *
       * onSuccess() will:
       *
       * 1. get final paid bill
       * 2. print final bill
       * 3. refresh outstanding list
       */

      await onSuccess(result as PaymentResult);
    } catch (error: any) {
      console.error("Payment error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save payment.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     PAYMENT MODAL
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-lg sm:rounded-[2rem]">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Receive Payment
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              #{bill.bill_no}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 disabled:opacity-50"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* CUSTOMER */}

          <div className="text-sm">
            <div className="font-bold text-slate-800">{bill.customer_name}</div>

            <div className="text-slate-500">{bill.consumer_no}</div>
          </div>

          {/* PAYMENT DATE */}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Payment Date
            </label>

            <input
              type="date"
              value={paymentDate}
              disabled={loading}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          {/* AMOUNT */}

          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-slate-500">Bill Amount</span>

              <span className="font-semibold">₹{baseAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1 text-sm">
              <span className="text-slate-500">Penalty</span>

              <span className="font-semibold text-red-600">
                {loadingPenalty
                  ? "Calculating..."
                  : `₹${Number(penalty).toFixed(2)}`}
              </span>
            </div>

            <div className="my-3 border-t border-slate-200" />

            <div className="flex justify-between">
              <span className="font-bold text-slate-700">FULL PAYMENT</span>

              <span className="text-2xl font-bold text-emerald-600">
                ₹{finalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* PAYMENT METHOD */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2">
              {["Cash", "UPI", "Bank"].map((method) => (
                <button
                  key={method}
                  type="button"
                  disabled={loading}
                  onClick={() => setPaymentMethod(method)}
                  className={
                    paymentMethod === method
                      ? "rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white"
                      : "rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-600"
                  }
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* REFERENCE */}

          {paymentMethod !== "Cash" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Reference Number
              </label>

              <input
                type="text"
                value={referenceNo}
                disabled={loading}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Transaction / reference number"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>
          )}

          {/* REMARKS */}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Remarks
            </label>

            <textarea
              value={remarks}
              disabled={loading}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Optional remarks"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          {/* SUBMIT */}

          <button
            type="button"
            disabled={loading || loadingPenalty || finalAmount <= 0}
            onClick={submitPayment}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-4 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-repeat mr-2 animate-spin" />
                Saving payment & printing...
              </>
            ) : (
              <>
                <i className="bi bi-printer mr-2" />
                Receive & Print ₹{finalAmount.toFixed(2)}
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            Full payment only. Partial payment is not allowed.
          </p>

          {loading && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center text-xs font-medium text-blue-700">
              Please wait. Payment is being saved and the final paid bill is
              being prepared for thermal printing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
