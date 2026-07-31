"use client";

import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileSidebar(false)}
          />

          {/* Sidebar */}
          <div className="relative w-72 h-full">
            <Sidebar mobile onClose={() => setMobileSidebar(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col">
        <Header onMenu={() => setMobileSidebar(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
}
