"use client";

import { Download } from "lucide-react";
import usePWAInstall from "@/hooks/usePWAInstall";

export default function InstallButton() {
  const { install, installed, canInstall } = usePWAInstall();

  if (installed) {
    return (
      <div className="w-full rounded-xl bg-green-500/20 border border-green-300/40 p-3 text-center text-green-100 font-medium">
        ✅ App Installed
      </div>
    );
  }

  if (!canInstall) {
    return null;
  }

  return (
    <button
      onClick={install}
      className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-sky-700 py-3 font-semibold hover:bg-sky-50 transition"
    >
      <Download size={18} />
      Install App
    </button>
  );
}
