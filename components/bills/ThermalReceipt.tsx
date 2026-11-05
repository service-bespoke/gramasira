"use client";

import Image from "next/image";
import QRCode from "react-qr-code";
import React from "react";
import printerService from "@/services/printer.service";

interface Props {
  bill: any;
}

export default function ThermalReceipt({ bill }: Props) {
  const info = bill?.bill ?? {};
  const details = bill?.details ?? [];
  const funds = bill?.funds ?? [];

  /* =========================================================
     CONSUMER NUMBER
  ========================================================= */

  const consumerNo =
    info.consumer_no ||
    info.consumer_number ||
    info.customer?.consumer_no ||
    info.customer?.consumer_number ||
    "";

  /* =========================================================
     FORMAT NUMBER
  ========================================================= */

  const format = (value: any) =>
    Number(value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* =========================================================
     FORMAT DATE

     Output: DD/MM/YYYY

     Supports:
     YYYY-MM-DD
     YYYY-MM-DD HH:mm:ss
     YYYY-MM-DDTHH:mm:ss
     YYYY/MM/DD
     DD-MM-YYYY
     DD/MM/YYYY
  ========================================================= */

  const formatDate = (value: any): string => {
    if (value === null || value === undefined || value === "") return "";

    // Date objects: use local date parts to avoid UTC day shifts.
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return "";
      const dd = String(value.getDate()).padStart(2, "0");
      const mm = String(value.getMonth() + 1).padStart(2, "0");
      const yyyy = String(value.getFullYear());
      return `${dd}/${mm}/${yyyy}`;
    }

    const dateString = String(value).trim();

    // MySQL / ISO: YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, YYYY-MM-DDTHH:mm:ss...
    let match = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    // YYYY/MM/DD (optional time after date)
    match = dateString.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    // DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY, DD-MM-YY
    match = dateString.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})(?:\s|$)/);
    if (match) {
      const [, day, month, year] = match;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${fullYear}`;
    }

    console.warn("Receipt date could not be parsed; original value retained:", value);
    return dateString;
  };

    
  /* =========================================================
     FORMAT BILL MONTH

     API may return bill_month as YYYY-MM-DD (for example,
     2026-11-01). Show only the billing month and year.
     Output example: November 2026.
  ========================================================= */

  const formatBillMonth = (value: any): string => {
    if (value === null || value === undefined || value === "") return "";

    const input = String(value).trim();
    const match = input.match(/^(\d{4})[-/](\d{1,2})(?:[-/]\d{1,2})?/);

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      if (month >= 1 && month <= 12) {
        return `${new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "long" })} ${year}`;
      }
    }

    return input;
  };

  const billMonth = formatBillMonth(info.bill_month ?? info.billMonth);

  /* =========================================================
     FORMATTED DATES

     Both Browser Print and Thermal Print use these values.
  ========================================================= */

  const dueDate = formatDate(info.due_date ?? info.dueDate);
  const createdDate = formatDate(info.created_at ?? info.createdAt);

  /* =========================================================
     DATE DEBUGGING
  ========================================================= */

  console.log("========== RECEIPT DATE DEBUG ==========");
  console.log("RAW DUE DATE:", info.due_date ?? info.dueDate);
  console.log("FORMATTED DUE DATE:", dueDate);
  console.log("RAW CREATED DATE:", info.created_at ?? info.createdAt);
  console.log("FORMATTED CREATED DATE:", createdDate);
  console.log("=========================================");

  /* =========================================================
     BUILD PRINT DATA
  ========================================================= */

  const buildPrintData = () => {
    const printData = {
      bill: {
        bill_no: info.bill_no ?? "",

        consumer_no: consumerNo,

        customer_name: info.customer_name ?? "",
        bill_month: billMonth,

        previous_reading: info.previous_reading ?? 0,
        current_reading: info.current_reading ?? 0,
        units: info.units ?? 0,

        water_charge: info.water_charge ?? 0,
        fixed_charge: info.fixed_charge ?? 0,
        meter_charge: info.meter_charge ?? 0,
        maintenance_charge: info.maintenance_charge ?? 0,
        penalty: info.penalty ?? 0,
        discount: info.discount ?? 0,

        total_amount: info.total_amount ?? 0,

        // Already formatted as DD/MM/YYYY
        due_date: dueDate,
        created_at: createdDate,
        payment_date: formatDate(info.payment_date ?? info.paymentDate),

        qr_string: info.qr_string ?? "",
      },

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

    console.log("========== COMPLETE PRINT DATA ==========");
    console.log("DUE DATE SENT:", printData.bill.due_date);
    console.log("CREATED DATE SENT:", printData.bill.created_at);
    console.log("PRINT DATA:", printData);
    console.log("==========================================");

    return printData;
  };

  /* =========================================================
     THERMAL PRINT
  ========================================================= */

  const handleThermalPrint = async () => {
    try {
      if (!printerService.isSupported()) {
        alert(
          "Web Bluetooth is not supported in this browser.\n\n" +
            "Please use Chrome on Android.",
        );

        return;
      }

      const printData = buildPrintData();

      console.log("THERMAL PRINT DATE CHECK");
      console.log("Due Date:", printData.bill.due_date);
      console.log("Created Date:", printData.bill.created_at);

      if (!printerService.isConnected()) {
        console.log("Printer not connected.");
        console.log("Opening Bluetooth pairing...");

        await printerService.connect();
      }

      if (!printerService.isConnected()) {
        throw new Error("Printer connection failed.");
      }

      console.log("Sending receipt to printer...");

      await printerService.printBill(printData);

      console.log("Receipt printed successfully.");

      alert("Receipt sent to thermal printer.");
    } catch (error: any) {
      console.error("THERMAL PRINT ERROR:", error);

      if (
        error?.name === "NotFoundError" ||
        error?.message?.toLowerCase()?.includes("cancel")
      ) {
        return;
      }

      alert(
        "Thermal printer error:\n\n" +
          (error?.message || "Unable to print receipt."),
      );
    }
  };

  /* =========================================================
     BROWSER PRINT
  ========================================================= */

  const handleBrowserPrint = () => {
    console.log("========== BROWSER PRINT DATE CHECK ==========");
    console.log("Due Date:", dueDate);
    console.log("Created Date:", createdDate);
    console.log("===============================================");

    window.print();
  };

  /* =========================================================
     RENDER RECEIPT
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        py-8
        flex
        justify-center
        print:bg-white
        print:p-0
      "
    >
      <div
        className="
          w-[302px]
          bg-white
          text-black
          shadow-2xl
          rounded-lg
          print:w-[302px]
          print:shadow-none
          print:rounded-none
        "
      >
        {/* HEADER */}

        <div
          className="
            text-center
            p-5
            border-b-2
            border-dashed
          "
        >
          <Image
            src="/icons/64x64.png"
            width={55}
            height={55}
            alt="Gramasira Logo"
            className="mx-auto rounded-xl"
          />

          <h1 className="text-xl font-bold mt-2">GRAMASIRA</h1>

          <div className="text-sm">Water Supply Scheme</div>

          <div className="text-xs text-gray-500 mt-1">
            Computer Generated Receipt
          </div>
        </div>

        {/* BILL DETAILS */}

        <div className="p-4 text-sm space-y-2">
          <div className="flex justify-between gap-3">
            <span>Bill No</span>
            <strong>{info.bill_no || ""}</strong>
          </div>

          <div className="flex justify-between gap-3">
            <span>Consumer Number</span>

            <strong className="text-right">
              {consumerNo || "Not Available"}
            </strong>
          </div>

          <div className="flex justify-between gap-3">
            <span>Name</span>

            <strong className="text-right">{info.customer_name || ""}</strong>
          </div>

          <div className="flex justify-between gap-3">
            <span>Month</span>

            <strong>{billMonth}</strong>
          </div>
        </div>

        <div className="border-t border-dashed" />

        {/* METER READING */}

        <div className="p-4">
          <div className="font-bold mb-3">Meter Reading</div>

          <div className="grid grid-cols-3 text-center">
            <div>
              <div className="text-xs text-gray-500">Previous</div>

              <b>{format(info.previous_reading)}</b>
            </div>

            <div>
              <div className="text-xs text-gray-500">Current</div>

              <b>{format(info.current_reading)}</b>
            </div>

            <div>
              <div className="text-xs text-gray-500">Units</div>

              <b>{format(info.units)}</b>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed" />

        {/* SLAB DETAILS */}

        <div className="p-4">
          <div className="font-bold mb-3">Consumption Charges</div>

          {details.map((item: any, index: number) => (
            <div key={index} className="mb-2 border-b border-dashed pb-2">
              <div className="text-xs text-gray-500">
                {item.slab_from}-{item.slab_to} Litres
              </div>

              <div className="flex justify-between">
                <span>
                  {format(item.units)} × ₹{format(item.rate)}
                </span>

                <b>₹{format(item.amount)}</b>
              </div>
            </div>
          ))}
        </div>

        {/* ADDITIONAL FUNDS */}

        {funds.length > 0 && (
          <div className="p-4 border-t border-dashed">
            <b>Additional Funds</b>

            {funds.map((item: any, index: number) => (
              <div key={index} className="flex justify-between mt-2 gap-3">
                <span>{item.fund_name}</span>

                <b>₹{format(item.amount)}</b>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed" />

        {/* CHARGES */}

        <div className="p-4 space-y-2">
          {[
            ["Water Charge", info.water_charge],
            ["Fixed Charge", info.fixed_charge],
            ["Meter Charge", info.meter_charge],
            ["Maintenance", info.maintenance_charge],
            ["Penalty", info.penalty],
            ["Discount", info.discount],
          ].map((row: any, index: number) => (
            <div key={index} className="flex justify-between gap-3">
              <span>{row[0]}</span>

              <b>₹{format(row[1])}</b>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-black" />

        {/* TOTAL */}

        <div className="p-5">
          <div
            className="
              flex
              justify-between
              text-xl
              font-bold
              gap-3
            "
          >
            <span>TOTAL</span>

            <span>₹{format(info.total_amount)}</span>
          </div>

          {/* DATE INFORMATION */}

          <div className="text-xs mt-3">Due Date : {dueDate}</div>

          <div className="text-xs mt-1">Created : {createdDate}</div>

          {/* TEMPORARY DATE DEBUG PANEL */}

          <div
            className="
              mt-3
              p-2
              border
              border-red-500
              bg-yellow-50
              text-black
              text-[10px]
              break-all
              print:hidden
            "
          >
            <strong>DATE DEBUG INFORMATION</strong>

            <div>Raw Due Date: {String(info.due_date ?? info.dueDate ?? "NULL")}</div>

            <div>Formatted Due Date: {dueDate}</div>

            <div>Raw Created Date: {String(info.created_at ?? info.createdAt ?? "NULL")}</div>

            <div>Formatted Created Date: {createdDate}</div>
            <div>Formatted Payment Date: {formatDate(info.payment_date ?? info.paymentDate)}</div>
          </div>
        </div>

        <div className="border-t border-dashed" />

        {/* QR CODE */}

        <div className="p-5 text-center">
          <div className="flex justify-center">
            <QRCode value={info.qr_string || ""} size={140} />
          </div>

          <div className="mt-3 text-xs font-semibold">Scan & Pay using UPI</div>
        </div>

        <div className="border-t border-dashed" />

        {/* FOOTER */}

        <div className="p-5 text-center">
          <div>Thank You</div>

          <b>Gramasira Water Supply</b>

          {/* PRINT BUTTONS */}

          <div className="mt-5 space-y-3 print:hidden">
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="
                w-full
                bg-gray-700
                hover:bg-gray-800
                text-white
                py-3
                rounded-xl
                font-semibold
              "
            >
              🖨 Browser Print
            </button>

            <button
              type="button"
              onClick={handleThermalPrint}
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                active:bg-blue-800
                text-white
                py-3
                rounded-xl
                font-semibold
              "
            >
              📱 Print to Thermal Printer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
