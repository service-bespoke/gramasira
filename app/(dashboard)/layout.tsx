"use client";

import { useState } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import BottomNavigation from "@/components/layout/BottomNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <MobileDrawer open={open} onClose={() => setOpen(false)} />

      <div className="lg:ml-72">
        <Header onMenu={() => setOpen(true)} />

        <main className="p-4 md:p-6 pb-24">{children}</main>
      </div>

      <BottomNavigation />
    </div>
  );
}
