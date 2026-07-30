"use client";
import { saveReading as saveOfflineReading } from "@/offline/reading";
import locationService from "@/services/location.service";
import { useEffect, useState } from "react";

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

  const [customerId, setCustomerId] = useState(0);

  const [previousReading, setPreviousReading] = useState(0);

  const [currentReading, setCurrentReading] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const data = await getCustomersForReading();
    console.log("Customers:", data);
    setCustomers(data);
  }

  useEffect(() => {
    if (!customerId) return;

    loadCustomer(customerId);
  }, [customerId]);

  async function loadCustomer(id: number) {
    const customer = await getCustomer(id);

    setPreviousReading(customer.previous_reading);
  }

  async function save() {
    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    const customer = customers.find(
      (c) => Number(c.customer_id) === Number(customerId),
    );
    if (!customer) {
      alert("Customer not found.");
      return;
    }

    // Get GPS
    const location = await locationService.getCurrentLocation();

    const readingData = {
      customer_id: customer.customer_id,
      consumer_no: customer.consumer_no,
      customer_name: customer.customer_name,

      previous_reading: previousReading,
      current_reading: currentReading,
      units: currentReading - previousReading,

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
        // Existing API save
        await saveReading({
          customer_id: customerId,
          current_reading: currentReading,
        });

        // Backup to IndexedDB as synced
        await saveOfflineReading({
          ...readingData,
          status: "Synced",
          synced_at: new Date().toISOString(),
        });

        alert("Reading saved successfully.");
      } else {
        // Offline save
        await saveOfflineReading({
          ...readingData,
          status: "Pending",
        });

        alert("Offline reading saved successfully.");
      }

      // Clear form
      setCustomerId(0);
      setPreviousReading(0);
      setCurrentReading(0);
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
