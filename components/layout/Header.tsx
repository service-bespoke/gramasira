"use client";

import { Menu, Bell, Search } from "lucide-react";

interface HeaderProps {
  onMenu: () => void;
}

export default function Header({ onMenu }: HeaderProps) {
  return (
    <header
      className="
      sticky
      top-0
      z-40

      backdrop-blur-xl
      bg-white/80

      border-b
      border-slate-200

      shadow-sm
      "
    >
      <div className="h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between">
        {/* Left */}

        <div className="flex items-center gap-3">
          {/* Mobile Menu */}

          <button
            onClick={onMenu}
            className="
            lg:hidden

            w-10
            h-10

            rounded-xl

            bg-sky-100

            flex
            items-center
            justify-center

            hover:bg-sky-200

            transition
            "
          >
            <Menu size={22} />
          </button>

          {/* Logo */}

          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold text-sky-700">Gramasira</h1>

            <p className="text-xs text-slate-500">Water Billing System</p>
          </div>
        </div>

        {/* Right */}

        <div className="flex items-center gap-3">
          {/* Search */}

          <button
            className="
            w-10
            h-10

            rounded-full

            bg-sky-50

            hover:bg-sky-100

            flex
            items-center
            justify-center

            transition
            "
          >
            <Search size={18} />
          </button>

          {/* Notification */}

          <button
            className="
            relative

            w-10
            h-10

            rounded-full

            bg-sky-50

            hover:bg-sky-100

            flex
            items-center
            justify-center

            transition
            "
          >
            <Bell size={18} />

            <span
              className="
              absolute
              top-2
              right-2

              w-2.5
              h-2.5

              rounded-full

              bg-red-500
              "
            />
          </button>

          {/* User */}

          <div
            className="
            flex
            items-center
            gap-3

            rounded-full

            bg-gradient-to-r
            from-sky-600
            to-cyan-500

            px-2
            py-1

            shadow-lg
            "
          >
            <div
              className="
              w-10
              h-10

              rounded-full

              bg-white

              flex
              items-center
              justify-center

              text-sky-700
              font-bold
              "
            >
              A
            </div>

            <div className="hidden md:block pr-3">
              <div className="text-sm font-bold text-white">Administrator</div>

              <div className="text-[11px] text-sky-100">Water Board</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
