"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SharePdfButton from "@/components/bills/SharePdfButton";

interface Props {
  billId: number;
  bill: any;
}

export default function BillActions({ billId, bill }: Props) {
  const router = useRouter();

  useEffect(() => {
    console.log("BillActions received:", bill);
  }, [bill]);

  return (
    <div className="flex flex-wrap gap-4 mt-8">
      {/* Thermal Receipt */}

      <button
        onClick={() =>
          window.open(
            `/bills/thermal/${billId}?autoprint=1`,
            "_blank",
            "width=420,height=800",
          )
        }
        className="
          flex items-center gap-2
          bg-orange-600
          hover:bg-orange-700
          text-white
          px-6
          py-3
          rounded-xl
          shadow-lg
          transition-all
        "
      >
        🖨️ Print Thermal Receipt
      </button>

      {/* Share PDF */}

      <SharePdfButton bill={bill} />

      {/* Back */}

      <button
        onClick={() => router.back()}
        className="
          flex items-center gap-2
          bg-gray-700
          hover:bg-gray-800
          text-white
          px-6
          py-3
          rounded-xl
          shadow-lg
          transition-all
        "
      >
        ← Back
      </button>
    </div>
  );
}
