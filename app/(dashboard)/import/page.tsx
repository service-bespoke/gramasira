"use client";

import * as XLSX from "xlsx";

import { useState } from "react";

import ExcelUploader from "@/components/import/ExcelUploader";

import SheetPreview from "@/components/import/SheetPreview";

import ImportService from "@/services/import.service";

export default function ImportPage() {
  const [preview, setPreview] = useState({
    customers: 0,

    tariffs: 0,

    bills: 0,

    funds: 0,
  });

  const [file, setFile] = useState<File>();

  function readExcel(file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      const workbook = XLSX.read(data, { type: "binary" });

      const customers = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
      );

      const tariffs = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[1]],
      );

      const bills = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[2]],
      );

      const funds = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[3]],
      );

      setPreview({
        customers: customers.length,

        tariffs: tariffs.length,

        bills: bills.length,

        funds: funds.length,
      });
    };

    reader.readAsBinaryString(file);

    setFile(file);
  }

  async function upload() {
    if (!file) {
      alert("Select Excel");

      return;
    }

    const fd = new FormData();

    fd.append("excel_file", file);

    const res = await ImportService.upload(fd);

    alert(res.data.message);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Import Excel</h1>

      <ExcelUploader onFileSelected={readExcel} />

      <div className="grid grid-cols-4 gap-5">
        <SheetPreview title="Customers" count={preview.customers} />

        <SheetPreview title="Tariff" count={preview.tariffs} />

        <SheetPreview title="Bill History" count={preview.bills} />

        <SheetPreview title="Additional Funds" count={preview.funds} />
      </div>

      <button
        onClick={upload}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        Import Excel
      </button>
    </div>
  );
}
