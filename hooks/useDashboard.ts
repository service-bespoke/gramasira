"use client";

import { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";

export default function useDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await dashboardService.getStats();
      console.log("Dashboard API:", data);
      setStats(data);
    } catch (err: any) {
      console.error("Dashboard Error:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Data:", err.response.data);
      } else {
        console.log("Message:", err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return {
    stats,
    loading,
    refresh: load,
  };
}
