import { api } from "./api";
import { Customer } from "@/types/customer";

import {
  saveCustomers,
  getCustomers as getOfflineCustomers,
} from "@/offline/customer";

export async function getCustomers(): Promise<Customer[]> {
  // Offline mode
  if (typeof window !== "undefined" && !navigator.onLine) {
    return await getOfflineCustomers();
  }

  try {
    const response = await api.get("/customers");

    console.log("API Response:", response);
console.log("Base URL:", api.defaults.baseURL);
    // Handle different API formats safely
    let data: any[] = [];

    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (Array.isArray(response.data?.data)) {
      data = response.data.data;
    } else if (Array.isArray(response.data?.customers)) {
      data = response.data.customers;
    } else {
      console.error("Invalid API Response:", response.data);

      const offline = await getOfflineCustomers();
      return offline || [];
    }

    const customers: Customer[] = data.map((item: any) => ({
      customer_id: Number(item.customer_id),
      consumer_no: item.consumer_no ?? "",
      customer_name: item.customer_name ?? "",
      address1: item.address1 ?? "",
      address2: item.address2 ?? "",
      address3: item.address3 ?? "",
      mobile: item.mobile ?? "",
      previous_reading: Number(item.previous_reading ?? 0),
    }));

    await saveCustomers(customers);

    return customers;
  } catch (error) {
    console.error("Customer API Error:", error);

    const offline = await getOfflineCustomers();

    return offline || [];
  }
}

const customerService = {
  getCustomers,
};

export default customerService;
