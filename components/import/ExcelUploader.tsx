"use client";

import { useState } from "react";

interface Props {
  onFileSelected: (file: File) => void;
}

export default function ExcelUploader({ onFileSelected }: Props) {
  const [filename, setFilename] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const file = e.target.files[0];

    setFilename(file.name);

    onFileSelected(file);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Excel</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />

      {filename && (
        <p className="mt-3 text-green-600">
          Selected :<b>{filename}</b>
        </p>
      )}
    </div>
  );
}
