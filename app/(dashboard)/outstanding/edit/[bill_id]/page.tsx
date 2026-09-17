"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import billService, {
  OutstandingBill,
  OutstandingBillUpdate,
} from "@/services/bill.service";

type FormData = {
  water_charge: number;
  fixed_charge: number;
  meter_charge: number;
  maintenance_charge: number;
  arrears: number;
  discount: number;
};

export default function OutstandingBillEditPage() {
  const router = useRouter();
  const params = useParams();

  const [bill, setBill] = useState<OutstandingBill | null>(null);

  const [form, setForm] = useState<FormData>({
    water_charge: 0,
    fixed_charge: 0,
    meter_charge: 0,
    maintenance_charge: 0,
    arrears: 0,
    discount: 0,
  });

  const [previewTotal, setPreviewTotal] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const billId = useMemo(() => {
    const value = params?.bill_id;

    if (Array.isArray(value)) {
      return Number(value[0]);
    }

    return Number(value);
  }, [params]);

  /* =========================================================
     LOAD BILL
     ========================================================= */

  useEffect(() => {
    if (!billId || Number.isNaN(billId)) {
      setError("Invalid bill ID.");
      setLoading(false);
      return;
    }

    loadBill();
  }, [billId]);

  async function loadBill() {
    try {
      setLoading(true);
      setError("");

      const response = await billService.getOutstandingBill(billId);

      if (!response) {
        throw new Error("Bill not found.");
      }

      const data = response as OutstandingBill;

      if (String(data.status).toLowerCase() !== "pending") {
        setError("This bill is no longer pending and cannot be modified.");
      }

      setBill(data);

      setForm({
        water_charge: Number(data.water_charge || 0),
        fixed_charge: Number(data.fixed_charge || 0),
        meter_charge: Number(data.meter_charge || 0),
        maintenance_charge: Number(data.maintenance_charge || 0),
        arrears: Number(data.arrears || 0),
        discount: Number(data.discount || 0),
      });

      setPreviewTotal(
        calculateTotal({
          water_charge: Number(data.water_charge || 0),
          fixed_charge: Number(data.fixed_charge || 0),
          meter_charge: Number(data.meter_charge || 0),
          maintenance_charge: Number(data.maintenance_charge || 0),
          arrears: Number(data.arrears || 0),
          discount: Number(data.discount || 0),
        }),
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message || err?.message || "Unable to load bill.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CALCULATE TOTAL
     ========================================================= */

  function calculateTotal(values: FormData) {
    const total =
      Number(values.water_charge || 0) +
      Number(values.fixed_charge || 0) +
      Number(values.meter_charge || 0) +
      Number(values.maintenance_charge || 0) +
      Number(values.arrears || 0) -
      Number(values.discount || 0);

    return Math.max(0, Number(total.toFixed(2)));
  }

  const liveTotal = calculateTotal(form);

  /* =========================================================
     FORM UPDATE
     ========================================================= */

  function updateField(field: keyof FormData, value: string) {
    const numberValue = value === "" ? 0 : Number(value);

    setForm((previous) => ({
      ...previous,
      [field]: Number.isNaN(numberValue) ? 0 : numberValue,
    }));

    setPreviewTotal(null);
    setSuccess("");
  }

  /* =========================================================
     BACKEND PREVIEW
     ========================================================= */

  async function recalculateBill() {
    if (!bill) {
      return;
    }

    try {
      setPreviewLoading(true);
      setError("");
      setSuccess("");

      const payload: OutstandingBillUpdate = {
        bill_id: bill.bill_id,
        water_charge: Number(form.water_charge || 0),
        fixed_charge: Number(form.fixed_charge || 0),
        meter_charge: Number(form.meter_charge || 0),
        maintenance_charge: Number(form.maintenance_charge || 0),
        arrears: Number(form.arrears || 0),
        discount: Number(form.discount || 0),
      };

      const response = await billService.previewOutstandingBill(payload);

      const total = Number(
        response?.total_amount ?? response?.total ?? liveTotal,
      );

      setPreviewTotal(total);

      setSuccess("Bill recalculated successfully.");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to recalculate bill.",
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  /* =========================================================
     SAVE MODIFIED BILL
     ========================================================= */

  async function saveBill() {
    if (!bill) {
      return;
    }

    if (String(bill.status).toLowerCase() !== "pending") {
      setError("Only pending bills can be modified.");
      return;
    }

    if (form.discount < 0) {
      setError("Discount cannot be negative.");
      return;
    }

    if (
      form.water_charge < 0 ||
      form.fixed_charge < 0 ||
      form.meter_charge < 0 ||
      form.maintenance_charge < 0 ||
      form.arrears < 0
    ) {
      setError("Charges cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: OutstandingBillUpdate = {
        bill_id: bill.bill_id,
        water_charge: Number(form.water_charge || 0),
        fixed_charge: Number(form.fixed_charge || 0),
        meter_charge: Number(form.meter_charge || 0),
        maintenance_charge: Number(form.maintenance_charge || 0),
        arrears: Number(form.arrears || 0),
        discount: Number(form.discount || 0),
      };

      const response = await billService.updateOutstandingBill(payload);

      if (response?.success === false || response?.status === false) {
        throw new Error(response?.message || "Unable to save bill.");
      }

      alert("Bill updated successfully.");

      router.push("/outstanding" as any);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save modified bill.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     FORMAT
     ========================================================= */

  function money(value: number) {
    return Number(value || 0).toFixed(2);
  }

  function formatDate(value?: string) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN");
  }

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl px-8 py-6 text-center shadow-xl">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />

          <p className="text-sm text-white/80">Loading bill...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="min-h-screen px-3 pb-10 pt-4 sm:px-5 lg:px-8">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/outstanding" as any)}
            className="mb-2 text-sm text-white/60 transition hover:text-white"
          >
            ← Back to Outstanding
          </button>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Modify Outstanding Bill
          </h1>

          <p className="mt-1 text-sm text-white/55">
            Update bill charges before receiving payment.
          </p>
        </div>

        {bill && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            {bill.status}
          </div>
        )}
      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      {!bill ? (
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 text-center text-white/70 backdrop-blur-xl">
          Bill not found.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          {/* =================================================
              LEFT
              ================================================= */}

          <div className="space-y-5">
            {/* CUSTOMER INFORMATION */}

            <section className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Customer Information
                  </h2>

                  <p className="text-xs text-white/50">
                    Bill and meter information
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
                  {bill.bill_no}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Consumer No." value={bill.consumer_no} />

                <InfoItem label="Customer" value={bill.customer_name} />

                <InfoItem label="Bill Month" value={bill.bill_month} />

                <InfoItem label="Due Date" value={formatDate(bill.due_date)} />

                <InfoItem
                  label="Previous Reading"
                  value={String(bill.previous_reading ?? 0)}
                />

                <InfoItem
                  label="Current Reading"
                  value={String(bill.current_reading ?? 0)}
                />

                <InfoItem
                  label="Units Consumed"
                  value={String(
                    bill.units ??
                      Math.max(
                        0,
                        Number(bill.current_reading || 0) -
                          Number(bill.previous_reading || 0),
                      ),
                  )}
                />

                <InfoItem
                  label="Original Bill Amount"
                  value={`₹ ${money(Number(bill.total_amount || 0))}`}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/5 px-4 py-3 text-xs leading-5 text-amber-100/75">
                Meter readings are locked here. Reading corrections must be
                handled separately from bill modification.
              </div>
            </section>

            {/* CHARGES */}

            <section className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">
                  Bill Charges
                </h2>

                <p className="text-xs text-white/50">
                  Modify the demand amount before payment.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ChargeInput
                  label="Water Charge"
                  value={form.water_charge}
                  onChange={(value) => updateField("water_charge", value)}
                />

                <ChargeInput
                  label="Fixed Charge"
                  value={form.fixed_charge}
                  onChange={(value) => updateField("fixed_charge", value)}
                />

                <ChargeInput
                  label="Meter Charge"
                  value={form.meter_charge}
                  onChange={(value) => updateField("meter_charge", value)}
                />

                <ChargeInput
                  label="Maintenance Charge"
                  value={form.maintenance_charge}
                  onChange={(value) => updateField("maintenance_charge", value)}
                />

                <ChargeInput
                  label="Arrears"
                  value={form.arrears}
                  onChange={(value) => updateField("arrears", value)}
                />

                <ChargeInput
                  label="Discount"
                  value={form.discount}
                  onChange={(value) => updateField("discount", value)}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={previewLoading}
                  onClick={recalculateBill}
                  className="flex-1 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {previewLoading ? "Recalculating..." : "↻ Recalculate Bill"}
                </button>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT - SUMMARY
              ================================================= */}

          <div className="lg:sticky lg:top-5 lg:self-start">
            <section className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Bill Summary
                </h2>

                <p className="text-xs text-white/50">
                  Amount payable before late penalty
                </p>
              </div>

              <div className="space-y-3">
                <SummaryRow label="Water Charge" value={form.water_charge} />

                <SummaryRow label="Fixed Charge" value={form.fixed_charge} />

                <SummaryRow label="Meter Charge" value={form.meter_charge} />

                <SummaryRow
                  label="Maintenance"
                  value={form.maintenance_charge}
                />

                <SummaryRow label="Arrears" value={form.arrears} />

                <SummaryRow label="Discount" value={-form.discount} />
              </div>

              <div className="my-5 border-t border-white/10" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-white/50">Payable Amount</p>

                  <p className="mt-1 text-3xl font-bold text-white">
                    ₹ {money(previewTotal !== null ? previewTotal : liveTotal)}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                  UNPAID
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-xs leading-5 text-white/55">
                Late penalty is not edited on this screen. It will be calculated
                by the server when payment is received.
              </div>

              <button
                type="button"
                disabled={
                  saving || String(bill.status).toLowerCase() !== "pending"
                }
                onClick={saveBill}
                className="mt-5 w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-slate-900 shadow-xl transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving Bill..." : "Save Modified Bill"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => router.push("/outstanding" as any)}
                className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   INFO ITEM
   =========================================================== */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-white/40">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-white">
        {value || "-"}
      </p>
    </div>
  );
}

/* ===========================================================
   CHARGE INPUT
   =========================================================== */

function ChargeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-white/60">
        {label}
      </span>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">
          ₹
        </span>

        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-white/15 bg-black/10 px-4 py-3 pl-9 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/20"
        />
      </div>
    </label>
  );
}

/* ===========================================================
   SUMMARY ROW
   =========================================================== */

function SummaryRow({ label, value }: { label: string; value: number }) {
  const amount = Number(value || 0);

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-white/55">{label}</span>

      <span
        className={
          amount < 0
            ? "font-medium text-emerald-300"
            : "font-medium text-white/85"
        }
      >
        {amount < 0 ? "- " : ""}₹ {Math.abs(amount).toFixed(2)}
      </span>
    </div>
  );
}
