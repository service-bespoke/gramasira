"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import billService from "@/services/bill.service";
import ThermalReceipt from "@/components/bills/ThermalReceipt";

export default function ThermalPage() {
  const params = useParams();

  const billId = Number(params.id);

  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBill();
  }, []);

  useEffect(() => {
    if (!bill) return;

    const timer = setTimeout(() => {
      window.print();
    }, 500);

    window.onafterprint = () => {
      window.close();
    };

    return () => {
      clearTimeout(timer);
    };
  }, [bill]);

  async function loadBill() {
    try {
      const data = await billService.getBill(billId);

      console.log("Thermal Bill", data);

      setBill(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl">
        Loading Receipt...
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        Receipt not found.
      </div>
    );
  }

  return (
    <div id="bill-preview">
      <ThermalReceipt bill={bill} />
    </div>
  );
}
