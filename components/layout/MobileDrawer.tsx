"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: Props) {
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <SheetContent side="left" className="w-72 p-0 bg-white border-none">
        <Sidebar mobile onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}
