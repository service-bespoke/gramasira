"use client";

import { useEffect } from "react";
import syncManager from "@/services/syncManager";


export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Start background sync
    syncManager.start();

    // Repeat sync every 5 minutes while the app is open
    const interval = setInterval(
      () => {
        syncManager.syncNow();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
