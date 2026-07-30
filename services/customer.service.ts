import { api } from "./api";
import { Customer } from "@/types/customer";

import {
  saveCustomers,
  getCustomers as getOfflineCustomers,
} from "@/offline/customer";

export async function getCustomers(): Promise<Customer[]> {
  if (typeof window !== "undefined" && !navigator.onLine) {
    return await getOfflineCustomers();
  }

  try {
    const response = await api.get("/customers");

    const customers: Customer[] = response.data.data.map((item: any) => ({
      customer_id: Number(item.customer_id),

      consumer_no: item.consumer_no,

      customer_name: item.customer_name,

      address1: item.address1,

      address2: item.address2,

      address3: item.address3,

      mobile: item.mobile,

      previous_reading: Number(item.previous_reading ?? 0),
    }));

    await saveCustomers(customers);

    return customers;
  } catch (error) {
    console.error(error);

    return await getOfflineCustomers();
  }
}

const customerService = {
  getCustomers,
};

export default customerService;
