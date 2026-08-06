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
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    initialize();

    const handleOnline = async () => {
      setOnline(true);
      await syncCustomers(false);
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function initialize() {
    setLoading(true);

    try {
      // Always load cached customers first
      const cache = await customerService.getCustomers();
      setCustomers(cache);

      const last = await customerSyncService.getLastSync();

      if (last) {
        setLastSync(new Date(last).toLocaleString());
      }

      // Sync in background when online
      if (navigator.onLine) {
        await syncCustomers(false);
      }
    } catch (error) {
      console.error("Initialization Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function syncCustomers(showMessage = false) {
    if (!navigator.onLine) return;

    try {
      setSyncing(true);

      const count = await customerSyncService.syncCustomers();

      const cache = await customerService.getCustomers();

      setCustomers(cache);

      const last = await customerSyncService.getLastSync();

      if (last) {
        setLastSync(new Date(last).toLocaleString());
      }

      if (showMessage) {
        alert(`${count} customers synchronized successfully.`);
      }
    } catch (error) {
      console.error(error);

      if (showMessage) {
        alert("Synchronization failed.");
      }
    } finally {
      setSyncing(false);
    }
  }

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) => {
      return (
        (customer.customer_name ?? "").toLowerCase().includes(keyword) ||
        (customer.consumer_no ?? "").toLowerCase().includes(keyword) ||
        (customer.mobile ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [customers, search]);

  return (
    <div className="space-y-4">
      <CustomerToolbar search={search} setSearch={setSearch} />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="text-sm text-gray-500">Last Sync : {lastSync}</div>

          <div className="text-sm font-medium">
            Cached Customers : {customers.length}
          </div>

          <div
            className={`text-sm font-semibold ${
              online ? "text-green-600" : "text-red-600"
            }`}
          >
            {online ? "🟢 Online" : "🔴 Offline"}
          </div>
        </div>

        <button
          onClick={() => syncCustomers(true)}
          disabled={!online || syncing}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
        >
          {syncing ? "Syncing..." : "🔄 Sync Customers"}
        </button>
      </div>

      <CustomerStats total={customers.length} />

      <CustomerTable customers={filteredCustomers} loading={loading} />
    </div>
  );
}
