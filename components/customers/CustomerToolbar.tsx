"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function CustomerToolbar({
  search,
  setSearch,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">

      <div>
        <h1 className="text-3xl font-bold">
          Customers
        </h1>

        <p className="text-gray-500">
          Manage water connection customers
        </p>
      </div>

      <div className="flex gap-3">

        <div className="relative">

          <Search
            className="absolute left-3 top-3 h-4 w-4 text-gray-400"
          />

          <Input
            placeholder="Search customer..."
            className="pl-10 w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <Button>

          <Plus className="mr-2 h-4 w-4"/>

          Add

        </Button>

      </div>

    </div>
  );
}