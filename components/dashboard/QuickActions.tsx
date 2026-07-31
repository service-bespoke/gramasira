"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";

import { Camera, FileText, Users, BarChart3 } from "lucide-react";

type QuickAction = {
  title: string;
  icon: LucideIcon;
  href: Route;
};

const actions: QuickAction[] = [
  {
    title: "Meter Reading",
    icon: Camera,
    href: "/readings",
  },
  {
    title: "Generate Bill",
    icon: FileText,
    href: "/bills",
  },
  {
    title: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    title: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Quick Actions</h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={() => router.push(item.href)}
              className="rounded-3xl bg-white shadow-lg p-6 hover:scale-105 transition"
            >
              <Icon size={34} className="text-sky-600 mx-auto" />

              <div className="mt-4 font-semibold text-center">{item.title}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
