"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
