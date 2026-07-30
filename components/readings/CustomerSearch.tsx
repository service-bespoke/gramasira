"use client";

import { useEffect, useRef, useState } from "react";
import { Customer } from "@/types/customer";

interface Props {
  customers: Customer[];
  value: number;
  onChange: (id: number) => void;
}

export default function CustomerSearch({ customers, value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selected = customers.find(
      (c) => Number(c.customer_id) === Number(value),
    );

    if (selected) {
      setSearch(`${selected.consumer_no} - ${selected.customer_name}`);
    }
  }, [value, customers]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = customers.filter((customer) => {
    const q = search.toLowerCase();

    return (
      (customer.customer_name ?? "").toLowerCase().includes(q) ||
      (customer.consumer_no ?? "").toLowerCase().includes(q) ||
      (customer.mobile ?? "").toLowerCase().includes(q) ||
      [customer.address1, customer.address2, customer.address3]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className="w-full border rounded-lg px-4 py-3"
        placeholder="Search Customer / Consumer No / Mobile"
        value={search}
        onFocus={() => setShowList(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowList(true);
        }}
      />

      {showList && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {filtered.map((customer) => (
            <div
              key={`${customer.customer_id}-${customer.consumer_no}`}
              className="cursor-pointer border-b p-3 hover:bg-blue-50"
              onClick={() => {
                onChange(Number(customer.customer_id));

                setSearch(
                  `${customer.consumer_no} - ${customer.customer_name}`,
                );

                setShowList(false);
              }}
            >
              <div className="font-semibold">
                {customer.consumer_no} - {customer.customer_name}
              </div>

              <div className="text-sm text-gray-500">{customer.mobile}</div>

              <div className="text-xs text-gray-400">
                {[customer.address1, customer.address2, customer.address3]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
