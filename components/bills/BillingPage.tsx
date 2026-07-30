"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BillTable from "./BillTable";
import BillPreviewDialog from "./BillPreviewDialog";

import billService from "@/services/bill.service";

export default function BillingPage() {
  const router = useRouter();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialog, setDialog] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [funds, setFunds] = useState<any[]>([]);
  const [selectedReading, setSelectedReading] = useState<number>(0);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    try {
      setLoading(true);

      const pending = await billService.pendingReadings();

      console.log("Pending Bills", pending);

      setRows(pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /*
  ------------------------------------------
  Open Bill Preview
  ------------------------------------------
  */

  async function openPreview(reading: any) {
    try {
      // IMPORTANT
      setSelectedReading(Number(reading.reading_id));

      const previewData = await billService.preview(reading.reading_id);
      const fundData = await billService.availableFunds();

      console.log("Preview", previewData);
      console.log("Funds", fundData);

      setPreview(previewData);
      setFunds(fundData);

      setDialog(true);
    } catch (err) {
      console.error(err);
      alert("Unable to load bill preview.");
    }
  }

  /*
  ------------------------------------------
  Generate Bill
  ------------------------------------------
  */

  async function generateBill(selectedFunds: number[]) {
    try {
      const result = await billService.generateBill(
        selectedReading,
        selectedFunds,
      );

      console.log(result);

      setDialog(false);

      await loadPending();

      if (result.status && result.bill_id) {
        router.push(`/bills/preview/${result.bill_id}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      alert("Bill generation failed.");
      return false;
    }
  }

  /*
  ------------------------------------------
  View Bill
  ------------------------------------------
  */

  function viewBill(bill_id: number) {
    router.push(`/bills/preview/${bill_id}`);
  }

  /*
  ------------------------------------------
  Thermal Print
  ------------------------------------------
  */
  /*
------------------------------------------
Thermal Preview
------------------------------------------
*/

  function thermalPrint(bill_id: number) {
    router.push(`/bills/thermal/${bill_id}`);
  }

  /*
------------------------------------------
A4 Preview
------------------------------------------
*/

  function a4Print(bill_id: number) {
    router.push(`/bills/print/${bill_id}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bill Generation</h1>

      <BillTable
        rows={rows}
        loading={loading}
        onGenerate={openPreview}
        onView={viewBill}
        onThermal={thermalPrint}
        onA4={a4Print}
      />

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
