"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import InstallButton from "@/components/layout/InstallButton";
import Image from "next/image";
import {
  Home,
  Users,
  Droplets,
  FileText,
  CreditCard,
  Upload,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Clock3,
  ChevronRight,
  DropletsIcon,
} from "lucide-react";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const menus = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Import Excel", href: "/import", icon: Upload },
  { title: "Meter Reading", href: "/readings", icon: Droplets },
  { title: "Bill Generation", href: "/bills", icon: FileText },
  //   { title: "Payments", href: "/payments", icon: CreditCard },
  //   { title: "Tariff", href: "/tariff", icon: Wallet },
  //   { title: "Additional Funds", href: "/funds", icon: Wallet },
  { title: "Bill History", href: "/reports", icon: BarChart3 },
  //   { title: "Pending Readings", href: "/readings/history", icon: Clock3 },
  //   { title: "Settings", href: "/settings", icon: Settings },
  { title: "Logout", href: "#", icon: LogOut },
];

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    }

    localStorage.removeItem("user");

    router.replace("/login");
  }

  return (
    <aside
      className={`
        ${
          mobile
            ? "w-full h-full"
            : "hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72"
        }

        flex-col
        bg-gradient-to-b
        from-sky-700
        via-sky-600
        to-cyan-600
        text-white
        shadow-2xl
        z-40
      `}
    >
      {/* Logo */}
      <div className="px-8 py-8 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg overflow-hidden">
            <Image
              src="/icons/64x64.png"
              width={45}
              height={45}
              alt="Gramasira Logo"
              className="rounded-xl"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-wide">Gramasira</h1>

            <p className="text-sm text-sky-100">Water Billing System</p>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          if (menu.title === "Logout") {
            return (
              <button
                key="logout"
                onClick={logout}
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  px-4
                  py-4
                  hover:bg-red-500
                  transition-all
                  duration-300
                "
              >
                <div className="flex items-center gap-4">
                  <Icon size={22} />
                  <span>{menu.title}</span>
                </div>

                <ChevronRight size={18} />
              </button>
            );
          }

          const active =
            pathname === menu.href || pathname.startsWith(menu.href + "/");

          return (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => onClose?.()}
              className={`
                group
                flex
                items-center
                justify-between
                rounded-2xl
                px-4
                py-4
                transition-all
                duration-300

                ${
                  active
                    ? "bg-white text-sky-700 shadow-xl scale-[1.02]"
                    : "hover:bg-white/20 hover:translate-x-1"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <Icon
                  size={22}
                  className={`
                    transition-transform
                    duration-300
                    ${active ? "" : "group-hover:scale-110"}
                  `}
                />

                <span className="font-medium">{menu.title}</span>
              </div>

              <ChevronRight
                size={18}
                className={
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }
              />
            </Link>
          );
        })}
      </nav>
      {/* Footer */}
      <div className="border-t border-white/20 p-6">
        <div className="rounded-2xl bg-white/15 backdrop-blur-md p-4">
          <div className="font-semibold text-sm">
            Gramasira Water Billing by Bespoke
          </div>

          <div className="text-xs text-sky-100 mt-1">
            Version 2.0 • PWA Edition
          </div>
        </div>
      </div>
      ;
    </aside>
  );
}
