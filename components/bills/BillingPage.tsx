"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BillTable from "./BillTable";
import BillPreviewDialog from "./BillPreviewDialog";

import billService from "@/services/bill.service";
import printerService from "@/services/printer.service";

export default function BillingPage() {
  const router = useRouter();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialog, setDialog] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [funds, setFunds] = useState<any[]>([]);
  const [selectedReading, setSelectedReading] = useState<number>(0);

  /* =========================================================
     LOAD PENDING READINGS
  ========================================================= */

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    try {
      setLoading(true);

      const pending = await billService.pendingReadings();

      console.log("Pending Bills:", pending);

      setRows(pending);
    } catch (err) {
      console.error("LOAD PENDING ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     OPEN BILL PREVIEW
  ========================================================= */

  async function openPreview(reading: any) {
    try {
      setSelectedReading(Number(reading.reading_id));

      const previewData = await billService.preview(reading.reading_id);

      const fundData = await billService.availableFunds();

      console.log("Preview:", previewData);
      console.log("Funds:", fundData);

      setPreview(previewData);
      setFunds(fundData);

      setDialog(true);
    } catch (err) {
      console.error("PREVIEW ERROR:", err);

      alert("Unable to load bill preview.");
    }
  }

  /* =========================================================
     GENERATE BILL
  ========================================================= */

  async function generateBill(selectedFunds: number[]) {
    try {
      const result = await billService.generateBill(
        selectedReading,
        selectedFunds,
      );

      console.log("Generate Bill Result:", result);

      setDialog(false);

      await loadPending();

      if (result.status && result.bill_id) {
        router.push(`/bills/preview/${result.bill_id}`);
      }

      return true;
    } catch (err) {
      console.error("GENERATE BILL ERROR:", err);

      alert("Bill generation failed.");

      return false;
    }
  }

  /* =========================================================
     VIEW BILL
  ========================================================= */

  function viewBill(bill_id: number) {
    router.push(`/bills/preview/${bill_id}`);
  }

  /* =========================================================
     THERMAL PRINT DIRECTLY
     
     No navigation to /bills/thermal anymore.

     This fetches the bill and sends it directly
     to printerService.
  ========================================================= */

  async function thermalPrint(bill_id: number) {
    try {
      console.log("================================");

      console.log("THERMAL PRINT REQUEST");

      console.log("Bill ID:", bill_id);

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
         Load complete bill
         
         IMPORTANT:
         Your billService needs a method that returns the
         complete bill including:
         
         bill
         details
         funds
      ------------------------------------------------------- */

      console.log("Loading bill data...");

      const billData = await billService.getBill(bill_id);

      console.log("Bill data:", billData);

      if (!billData) {
        throw new Error("Bill data could not be loaded.");
      }

      /* -------------------------------------------------------
         Check printer connection
         
         If not connected:
         Bluetooth pairing dialog opens.
      ------------------------------------------------------- */

      if (!printerService.isConnected()) {
        console.log("Printer is not connected.");

        console.log("Opening Bluetooth pairing...");

        await printerService.connect();
      }

      /* -------------------------------------------------------
         Verify connection
      ------------------------------------------------------- */

      if (!printerService.isConnected()) {
        throw new Error("Thermal printer is not connected.");
      }

      console.log("Printer connected.");

      /* -------------------------------------------------------
         PRINT
      ------------------------------------------------------- */

      console.log("Sending bill to thermal printer...");

      await printerService.printBill(billData);

      console.log("Thermal printing completed.");

      alert("Receipt sent to thermal printer.");
    } catch (error: any) {
      console.error("================================");

      console.error("THERMAL PRINT ERROR");

      console.error(error);

      console.error("================================");

      /* -------------------------------------------------------
         User cancelled Bluetooth pairing
      ------------------------------------------------------- */

      if (error?.name === "NotFoundError") {
        console.log("Bluetooth printer selection cancelled.");

        return;
      }

      alert(
        "Thermal printer error:\n\n" +
          (error?.message || "Unable to print receipt."),
      );
    }
  }

  /* =========================================================
     A4 PRINT
  ========================================================= */

  function a4Print(bill_id: number) {
    router.push(`/bills/print/${bill_id}`);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE TITLE
      ===================================================== */}

      <h1 className="text-3xl font-bold">Bill Generation</h1>

      {/* =====================================================
          BILL TABLE
      ===================================================== */}

      <BillTable
        rows={rows}
        loading={loading}
        onGenerate={openPreview}
        onView={viewBill}
        onThermal={thermalPrint}
        onA4={a4Print}
      />

      {/* =====================================================
          BILL PREVIEW DIALOG
      ===================================================== */}

      <BillPreviewDialog
        open={dialog}
        onClose={() => setDialog(false)}
        preview={preview}
        funds={funds}
        onGenerate={generateBill}
      />
    </div>
  );
}
