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
     FORMAT NUMBER
  ========================================================= */

  const format = (value: any) =>
    Number(value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* =========================================================
     FORMAT DATE
     
     Due Date:
        dd/mm/yyyy

     Created Date:
        dd/mm/yy
  ========================================================= */

  const formatDate = (value: any, shortYear = false) => {
    if (!value) return "";

    /*
     * Handle common MySQL datetime format:
     * YYYY-MM-DD HH:mm:ss
     *
     * Also handles:
     * YYYY-MM-DD
     */

    const valueString = String(value).trim();

    let date: Date;

    /*
     * MySQL date/datetime
     */
    if (/^\d{4}-\d{2}-\d{2}/.test(valueString)) {
      const parts = valueString.split(/[- :T]/);

      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);

      /*
       * Use local date construction so timezone conversion
       * does not accidentally change the displayed date.
       */
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(valueString);
    }

    if (isNaN(date.getTime())) {
      return valueString;
    }

    const day = String(date.getDate()).padStart(2, "0");

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const year = shortYear
      ? String(date.getFullYear()).slice(-2)
      : String(date.getFullYear());

    return `${day}/${month}/${year}`;
  };

  /* =========================================================
     BUILD PRINT DATA
  ========================================================= */

  const buildPrintData = () => {
    return {
      bill: {
        bill_no: info.bill_no ?? "",
        consumer_no: info.consumer_no ?? "",
        customer_name: info.customer_name ?? "",
        bill_month: info.bill_month ?? "",

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

        /*
         * Due Date -> dd/mm/yyyy
         */
        due_date: formatDate(info.due_date),

        /*
         * Created Date -> dd/mm/yy
         */
        created_at: formatDate(info.created_at, true),

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
  };

  /* =========================================================
     THERMAL PRINT

     Clicking this button directly opens Bluetooth pairing
     if printer is not already connected.
  ========================================================= */

  const handleThermalPrint = async () => {
    try {
      /* -------------------------------------------------------
         Check Web Bluetooth
      ------------------------------------------------------- */

      if (!printerService.isSupported()) {
        alert(
          "Web Bluetooth is not supported in this browser.\n\n" +
            "Please use Chrome on Android.",
        );

        return;
      }

      /* -------------------------------------------------------
         Prepare bill data
      ------------------------------------------------------- */

      const printData = buildPrintData();

      console.log("================================");
      console.log("THERMAL PRINT");
      console.log("PRINT DATA:", printData);
      console.log("================================");

      /* -------------------------------------------------------
         Connect automatically

         If printer is already connected:
             no pairing dialog

         If printer is NOT connected:
             Bluetooth pairing dialog opens
      ------------------------------------------------------- */

      if (!printerService.isConnected()) {
        console.log("Printer not connected.");
        console.log("Opening Bluetooth pairing...");

        await printerService.connect();
      }

      /* -------------------------------------------------------
         Check connection
      ------------------------------------------------------- */

      if (!printerService.isConnected()) {
        throw new Error("Printer connection failed.");
      }

      /* -------------------------------------------------------
         Print
      ------------------------------------------------------- */

      console.log("Sending receipt to printer...");

      await printerService.printBill(printData);

      console.log("Receipt printed successfully.");

      alert("Receipt sent to thermal printer.");
    } catch (error: any) {
      console.error("================================");
      console.error("THERMAL PRINT ERROR");
      console.error(error);
      console.error("================================");

      /* -------------------------------------------------------
         User cancelled Bluetooth pairing
      ------------------------------------------------------- */

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
    window.print();
  };

  /* =========================================================
     RENDER
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
        {/* =====================================================
            HEADER
        ===================================================== */}

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

        {/* =====================================================
            BILL DETAILS
        ===================================================== */}

        <div className="p-4 text-sm space-y-2">
          <div className="flex justify-between gap-3">
            <span>Bill No</span>

            <strong>{info.bill_no}</strong>
          </div>

          <div className="flex justify-between gap-3">
            <span>Consumer</span>

            <strong>{info.consumer_no}</strong>
          </div>

          <div className="flex justify-between gap-3">
            <span>Name</span>

            <strong className="text-right">{info.customer_name}</strong>
          </div>

          <div className="flex justify-between gap-3">
            <span>Month</span>

            <strong>{info.bill_month}</strong>
          </div>
        </div>

        <div className="border-t border-dashed" />

        {/* =====================================================
            METER READING
        ===================================================== */}

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

        {/* =====================================================
            SLAB DETAILS
        ===================================================== */}

        <div className="p-4">
          <div className="font-bold mb-3">Consumption Charges</div>

          {details.map((item: any, index: number) => (
            <div
              key={index}
              className="
                mb-2
                border-b
                border-dashed
                pb-2
              "
            >
              <div className="text-xs text-gray-500">
                {item.slab_from}-{item.slab_to} Litres
              </div>

              <div className="flex justify-between">
                <span>
                  {format(item.units)}× ₹{format(item.rate)}
                </span>

                <b>₹{format(item.amount)}</b>
              </div>
            </div>
          ))}
        </div>

        {/* =====================================================
            FUNDS
        ===================================================== */}

        {funds.length > 0 && (
          <div
            className="
              p-4
              border-t
              border-dashed
            "
          >
            <b>Additional Funds</b>

            {funds.map((item: any, index: number) => (
              <div
                key={index}
                className="
                  flex
                  justify-between
                  mt-2
                "
              >
                <span>{item.fund_name}</span>

                <b>₹{format(item.amount)}</b>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed" />

        {/* =====================================================
            CHARGES
        ===================================================== */}

        <div className="p-4 space-y-2">
          {[
            ["Water Charge", info.water_charge],
            ["Fixed Charge", info.fixed_charge],
            ["Meter Charge", info.meter_charge],
            ["Maintenance", info.maintenance_charge],
            ["Penalty", info.penalty],
            ["Discount", info.discount],
          ].map((row: any, index: number) => (
            <div
              key={index}
              className="
                flex
                justify-between
                gap-3
              "
            >
              <span>{row[0]}</span>

              <b>₹{format(row[1])}</b>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-black" />

        {/* =====================================================
            TOTAL
        ===================================================== */}

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

          {/* =================================================
              DATE INFORMATION

              Due Date  -> dd/mm/yyyy
              Created   -> dd/mm/yy
          ================================================= */}

          <div className="text-xs mt-2">
            Due Date : {formatDate(info.due_date)}
          </div>

          <div className="text-xs mt-1">
            Created : {formatDate(info.created_at, true)}
          </div>
        </div>

        <div className="border-t border-dashed" />

        {/* =====================================================
            QR CODE
        ===================================================== */}

        <div className="p-5 text-center">
          <div className="flex justify-center">
            <QRCode value={info.qr_string || ""} size={140} />
          </div>

          <div className="mt-3 text-xs font-semibold">Scan & Pay using UPI</div>
        </div>

        <div className="border-t border-dashed" />

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="p-5 text-center">
          <div>Thank You</div>

          <b>Gramasira Water Supply</b>

          {/* =================================================
              PRINT BUTTONS
          ================================================= */}

          <div
            className="
              mt-5
              space-y-3
              print:hidden
            "
          >
            {/* =================================================
                BROWSER PRINT
            ================================================= */}

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

            {/* =================================================
                DIRECT THERMAL PRINT
            ================================================= */}

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
