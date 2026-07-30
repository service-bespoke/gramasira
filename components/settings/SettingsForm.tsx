"use client";

import { useEffect, useState } from "react";
import settingsService from "@/services/settings.service";

export default function SettingsForm() {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    water_board_name: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    upi_id: "",
    merchant_name: "",
    receipt_footer: "",
    bill_prefix: "",
    bill_due_days: 5,
    thermal_width: "80",
    currency: "INR",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await settingsService.getSettings();

      // console.log(res.data);

      if (res.data.status) {
        const s = res.data.data || {};

        setForm({
          water_board_name: s.water_board_name || "",
          address: s.address || "",
          phone: s.phone || "",
          email: s.email || "",
          logo: s.logo || "",
          upi_id: s.upi_id || "",
          merchant_name: s.merchant_name || "",
          receipt_footer: s.receipt_footer || "",
          bill_prefix: s.bill_prefix || "",
          bill_due_days: Number(s.bill_due_days || 5),
          thermal_width: s.thermal_width || "80",
          currency: s.currency || "INR",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function change(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function save() {
    try {
      const res = await settingsService.saveSettings(form);

      alert(res.data.message);
    } catch (err) {
      console.error(err);

      alert("Unable to save settings");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label>Water Board Name</label>
          <input
            className="border w-full p-2 rounded"
            name="water_board_name"
            value={form.water_board_name}
            onChange={change}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            className="border w-full p-2 rounded"
            name="phone"
            value={form.phone}
            onChange={change}
          />
        </div>

        <div className="col-span-2">
          <label>Address</label>
          <textarea
            className="border w-full p-2 rounded"
            name="address"
            rows={3}
            value={form.address}
            onChange={change}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            className="border w-full p-2 rounded"
            name="email"
            value={form.email}
            onChange={change}
          />
        </div>

        <div>
          <label>UPI ID</label>
          <input
            className="border w-full p-2 rounded"
            name="upi_id"
            value={form.upi_id}
            onChange={change}
          />
        </div>

        <div>
          <label>Merchant Name</label>
          <input
            className="border w-full p-2 rounded"
            name="merchant_name"
            value={form.merchant_name}
            onChange={change}
          />
        </div>

        <div>
          <label>Bill Prefix</label>
          <input
            className="border w-full p-2 rounded"
            name="bill_prefix"
            value={form.bill_prefix}
            onChange={change}
          />
        </div>

        <div>
          <label>Bill Due Days</label>
          <input
            type="number"
            className="border w-full p-2 rounded"
            name="bill_due_days"
            value={form.bill_due_days}
            onChange={change}
          />
        </div>

        <div>
          <label>Thermal Width</label>

          <select
            className="border w-full p-2 rounded"
            name="thermal_width"
            value={form.thermal_width}
            onChange={change}
          >
            <option value="58">58 mm</option>
            <option value="80">80 mm</option>
          </select>
        </div>

        <div>
          <label>Currency</label>

          <select
            className="border w-full p-2 rounded"
            name="currency"
            value={form.currency}
            onChange={change}
          >
            <option value="INR">INR</option>
          </select>
        </div>

        <div className="col-span-2">
          <label>Receipt Footer</label>

          <textarea
            className="border w-full p-2 rounded"
            rows={4}
            name="receipt_footer"
            value={form.receipt_footer}
            onChange={change}
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={save}
          className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
