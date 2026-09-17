"use client";

import { Download, Share, Smartphone, CheckCircle2 } from "lucide-react";

import { useEffect, useState } from "react";
import usePWAInstall from "@/hooks/usePWAInstall";

export default function InstallButton() {
  const { install, installed, canInstall, isIOS } = usePWAInstall();

  const [showHelp, setShowHelp] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();

    setIsAndroid(ua.includes("android"));
  }, []);

  /* ==========================================
     ALREADY INSTALLED
  ========================================== */

  if (installed) {
    return (
      <div
        className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-green-500/20
          border
          border-green-300/40
          p-3
          text-green-100
          font-medium
        "
      >
        <CheckCircle2 size={18} />
        App Installed
      </div>
    );
  }

  /* ==========================================
     ANDROID / CHROME / EDGE
     NATIVE INSTALL PROMPT AVAILABLE
  ========================================== */

  if (canInstall) {
    return (
      <button
        type="button"
        onClick={install}
        className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-white
          text-sky-700
          py-3
          px-4
          font-semibold
          shadow-lg
          hover:bg-sky-50
          active:scale-[0.98]
          transition
        "
      >
        <Download size={18} />
        Install App
      </button>
    );
  }

  /* ==========================================
     IOS
  ========================================== */

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-white
            text-sky-700
            py-3
            px-4
            font-semibold
            shadow-lg
            hover:bg-sky-50
            active:scale-[0.98]
            transition
          "
        >
          <Download size={18} />
          Install App
        </button>

        {showHelp && (
          <div
            className="
              mt-2
              w-full
              rounded-xl
              bg-black/20
              border
              border-white/20
              p-3
              text-white
              text-sm
            "
          >
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <Share size={16} />
              Add to Home Screen
            </div>

            <p className="text-xs text-white/75 leading-relaxed">
              In Safari, tap the <strong>Share</strong> button and then choose{" "}
              <strong>Add to Home Screen</strong>.
            </p>
          </div>
        )}
      </>
    );
  }

  /* ==========================================
     ANDROID
     INSTALL PROMPT NOT AVAILABLE
  ========================================== */

  if (isAndroid) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-white
            text-sky-700
            py-3
            px-4
            font-semibold
            shadow-lg
            hover:bg-sky-50
            active:scale-[0.98]
            transition
          "
        >
          <Smartphone size={18} />
          Install App
        </button>

        {showHelp && (
          <div
            className="
              mt-2
              w-full
              rounded-xl
              bg-black/20
              border
              border-white/20
              p-3
              text-white
              text-xs
              leading-relaxed
            "
          >
            <p className="font-semibold mb-1">Install from Chrome</p>

            <p className="text-white/75">
              Open the browser menu <strong>⋮</strong> and look for
              <strong> Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </p>
          </div>
        )}
      </>
    );
  }

  /* ==========================================
     DESKTOP
  ========================================== */

  return (
    <button
      type="button"
      onClick={() => setShowHelp(!showHelp)}
      className="
        w-full
        flex
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-white
        text-sky-700
        py-3
        px-4
        font-semibold
        shadow-lg
        hover:bg-sky-50
        active:scale-[0.98]
        transition
      "
    >
      <Download size={18} />
      Install App
    </button>
  );
}
