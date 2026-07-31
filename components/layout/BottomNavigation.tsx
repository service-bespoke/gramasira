"use client";

import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Home, Droplets, FileText, Settings } from "lucide-react";

type BottomMenu = {
  title: string;
  href: Route;
  icon: LucideIcon;
};

const menus: BottomMenu[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Reading",
    href: "/readings",
    icon: Droplets,
  },
  {
    title: "Bills",
    href: "/bills",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="
        lg:hidden
        fixed
        bottom-0
        left-0
        right-0
        z-50
        bg-white/90
        backdrop-blur-xl
        border-t
        border-slate-200
        shadow-xl
      "
    >
      <div className="grid grid-cols-4 h-16">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active =
            menu.href === "/"
              ? pathname === "/"
              : pathname === menu.href || pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-1
                transition-all
                duration-200
              "
            >
              <Icon
                size={22}
                className={active ? "text-sky-600" : "text-slate-500"}
              />

              <span
                className={`text-[11px] ${
                  active ? "text-sky-600 font-semibold" : "text-slate-500"
                }`}
              >
                {menu.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
