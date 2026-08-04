"use client";

import { useEffect, useState } from "react";

import { saveReading as saveOfflineReading } from "@/offline/reading";
import locationService from "@/services/location.service";

import ReadingToolbar from "./ReadingToolbar";
import ReadingForm from "./ReadingForm";

import {
  getCustomersForReading,
  getCustomer,
  saveReading,
} from "@/services/reading.service";

import { Customer } from "@/types/customer";

export default function ReadingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [customerId, setCustomerId] = useState<number>(0);

  const [previousReading, setPreviousReading] = useState<number>(0);

  // FIXED
  const [currentReading, setCurrentReading] = useState<number | "">("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const data = await getCustomersForReading();
      console.log("Customers:", data);
      setCustomers(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!customerId) return;

    loadCustomer(customerId);
  }, [customerId]);

  async function loadCustomer(id: number) {
    try {
      const customer = await getCustomer(id);

      setPreviousReading(Number(customer.previous_reading ?? 0));
    } catch (err) {
      console.error(err);
    }
  }

  async function save() {
    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    if (currentReading === "") {
      alert("Please enter current reading.");
      return;
    }

    if (currentReading < previousReading) {
      alert("Current reading cannot be less than previous reading.");
      return;
    }

    const customer = customers.find(
      (c) => Number(c.customer_id) === Number(customerId),
    );

    if (!customer) {
      alert("Customer not found.");
      return;
    }

    const location = await locationService.getCurrentLocation();

    const units = currentReading - previousReading;

    const readingData = {
      customer_id: customer.customer_id,
      consumer_no: customer.consumer_no,
      customer_name: customer.customer_name,

      previous_reading: previousReading,
      current_reading: currentReading,
      units,

      latitude: location.success ? location.latitude : undefined,
      longitude: location.success ? location.longitude : undefined,
      accuracy: location.success ? location.accuracy : undefined,

      captured_at: new Date().toISOString(),
      device_time: new Date().toLocaleString(),

      photo: "",
      status: "Pending",
    };

    try {
      if (navigator.onLine) {
        await saveReading({
          customer_id: customerId,
          current_reading: currentReading,
        });

        await saveOfflineReading({
          ...readingData,
          status: "Synced",
          synced_at: new Date().toISOString(),
        });

        alert("Reading saved successfully.");
      } else {
        await saveOfflineReading({
          ...readingData,
          status: "Pending",
        });

        alert("Offline reading saved successfully.");
      }

      setCustomerId(0);
      setPreviousReading(0);

      // FIXED
      setCurrentReading("");
    } catch (err) {
      console.error(err);
      alert("Unable to save reading.");
    }
  }

  return (
    <>
      <ReadingToolbar />

      <ReadingForm
        customers={customers}
        customerId={customerId}
        setCustomerId={setCustomerId}
        previousReading={previousReading}
        currentReading={currentReading}
        setCurrentReading={setCurrentReading}
        save={save}
      />
    </>
  );
}
