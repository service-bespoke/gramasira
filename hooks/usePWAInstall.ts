"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    /* ==========================================
       CHECK IOS
    ========================================== */

    const userAgent = window.navigator.userAgent;

    const ios =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    setIsIOS(ios);

    /* ==========================================
       CHECK IF ALREADY INSTALLED
    ========================================== */

    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      setInstalled(standalone);

      if (standalone) {
        setCanInstall(false);
      }
    };

    checkInstalled();

    /* ==========================================
       ANDROID / CHROME / EDGE INSTALL PROMPT
    ========================================== */

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      const promptEvent = event as BeforeInstallPromptEvent;

      setDeferredPrompt(promptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    /* ==========================================
       APP INSTALLED EVENT
    ========================================== */

    const handleAppInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    /* ==========================================
       DISPLAY MODE CHANGE
    ========================================== */

    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const handleDisplayModeChange = () => {
      checkInstalled();
    };

    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener("appinstalled", handleAppInstalled);

      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  /* ==========================================
     INSTALL
  ========================================== */

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstalled(true);
      }

      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error("PWA installation failed:", error);
    }
  }, [deferredPrompt]);

  return {
    install,
    installed,
    canInstall,
    isIOS,
  };
}
