"use client";

import useDashboard from "@/hooks/useDashboard";

import { Users, Droplets, FileText, IndianRupee } from "lucide-react";

import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardCard from "@/components/dashboard/DashboardCard";
import QuickActions from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-lg font-medium text-slate-500">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHero />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Customers"
  value={stats?.customers ?? 0}
          icon={<Users />}
          color="bg-sky-600"
        />

        <DashboardCard
                  title="Pending"
                  value={stats?.pending ?? 0}
          
          icon={<Droplets />}
          color="bg-orange-500"
        />

        <DashboardCard
          title="Bills"
                 
                   value={stats?.bills ?? 0}
          icon={<FileText />}
          color="bg-green-600"
        />

        <DashboardCard
          title="Collection"
          value={`₹${Number(stats?.collection ?? 0).toLocaleString("en-IN")}`}
          icon={<IndianRupee />}
          color="bg-purple-600"
        />
      </div>

      <QuickActions />
    </div>
  );
}
