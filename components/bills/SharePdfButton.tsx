"use client";

import { generateBillPdf } from "@/lib/generateBillPdf";

interface Props {
  bill: any;
}

export default function SharePdfButton({ bill }: Props) {
  async function sharePdf() {
    try {
      console.log("Bill received in SharePdfButton:", bill);

      if (!bill || !bill.bill) {
        alert("Bill data not available.");
        return;
      }

      const doc = generateBillPdf(bill);

      const blob = doc.output("blob");

      const fileName = `${bill.bill.bill_no}.pdf`;

      const file = new File([blob], fileName, {
        type: "application/pdf",
      });

      // Mobile Share API
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Water Bill ${bill.bill.bill_no}`,
          text: `Water Bill - ${bill.bill.bill_no}`,
          files: [file],
        });

        return;
      }

      // Desktop Download
      doc.save(fileName);
    } catch (error) {
      console.error("PDF Generation Error:", error);

      alert("Unable to generate PDF.");
    }
  }

  return (
    <button
      onClick={sharePdf}
      className="
        flex items-center
        gap-2
        bg-green-600
        hover:bg-green-700
        text-white
        px-6
        py-3
        rounded-xl
        shadow-lg
        transition-all
        duration-300
      "
    >
      📤 Share Bill
    </button>
  );
}
