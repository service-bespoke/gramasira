"use client";

import { useEffect, useMemo, useState } from "react";

import { Customer } from "@/types/customer";

import customerService from "@/services/customer.service";
import customerSyncService from "@/services/customerSync.service";

import CustomerToolbar from "./CustomerToolbar";
import CustomerStats from "./CustomerStats";
import CustomerTable from "./CustomerTable";

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [lastSync, setLastSync] = useState("Never");

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    setLoading(true);

    try {
      // Load customers from IndexedDB
      const offlineCustomers = await customerService.getCustomers();
      setCustomers(offlineCustomers);

      // Load last sync time
      const last = await customerSyncService.getLastSync();

      if (last) {
        setLastSync(new Date(last).toLocaleString());
      }

      // First time & online -> sync automatically
      if (navigator.onLine && offlineCustomers.length === 0) {
        await syncCustomers(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function syncCustomers(showAlert = true) {
    setSyncing(true);

    try {
      const count = await customerSyncService.syncCustomers();

      // Reload from IndexedDB
      const data = await customerService.getCustomers();

      setCustomers(data);

      const last = await customerSyncService.getLastSync();

      if (last) {
        setLastSync(new Date(last).toLocaleString());
      }

      if (showAlert) {
        alert(`${count} customers synchronized successfully.`);
      }
    } catch (err) {
      console.error(err);

      if (showAlert) {
        alert("Unable to synchronize customers.");
      }
    } finally {
      setSyncing(false);
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      return (
        (customer.customer_name ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (customer.consumer_no ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (customer.mobile ?? "").includes(search)
      );
    });
  }, [customers, search]);

  return (
    <>
      <CustomerToolbar search={search} setSearch={setSearch} />

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Last Sync : {lastSync}</p>

          <p className="text-xs text-green-600">
            Cached Customers : {customers.length}
          </p>
        </div>

        <button
          onClick={() => syncCustomers(true)}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          {syncing ? "Syncing..." : "🔄 Sync Customers"}
        </button>
      </div>

      <CustomerStats total={customers.length} />

      <CustomerTable customers={filteredCustomers} loading={loading} />
    </>
  );
}
