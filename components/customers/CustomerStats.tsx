"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface Props {
  total: number;
}

export default function CustomerStats({ total }: Props) {
  return (
    <Card className="mb-6">
      <CardContent className="flex items-center gap-5 p-6">
        <div className="bg-blue-100 p-4 rounded-full">
          <Users className="text-blue-700" />
        </div>

        <div>
          <p className="text-gray-500">Total Customers</p>

          <h2 className="text-3xl font-bold">{total}</h2>
        </div>
      </CardContent>
    </Card>
  );
}
