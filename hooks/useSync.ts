"use client";

import { useEffect, useState } from "react";
import syncManager from "@/services/syncManager";

export default function useSync() {
  const [online, setOnline] = useState(syncManager.isOnline());

  const [pending, setPending] = useState(0);

  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setPending(await syncManager.pendingCount());

      setLastSync(syncManager.lastSync());
    }

    load();

    function onlineHandler() {
      setOnline(true);

      syncManager.syncNow();
    }

    function offlineHandler() {
      setOnline(false);
    }

    window.addEventListener("online", onlineHandler);

    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);

      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  return {
    online,

    pending,

    lastSync,

    syncing: syncManager.isSyncing(),
  };
}
