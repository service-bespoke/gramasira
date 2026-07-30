import { api } from "./api";
import { db } from "@/offline/db";
import { Customer } from "@/types/customer";

class CustomerSyncService {
  /**
   * Download latest customers from server
   * Save to IndexedDB
   */
  async syncCustomers(): Promise<number> {
    try {
      const response = await api.get("/customers");

      if (!response.data.status) {
        throw new Error("Unable to fetch customers");
      }

      const customers: Customer[] = response.data.data.map((item: any) => ({
        customer_id: Number(item.customer_id),
        consumer_no: item.consumer_no ?? "",
        customer_name: item.customer_name ?? "",
        address1: item.address1 ?? "",
        address2: item.address2 ?? "",
        address3: item.address3 ?? "",
        mobile: item.mobile ?? "",
        previous_reading: Number(item.previous_reading ?? 0),
      }));

      // Replace existing customers
      await db.customers.clear();

      await db.customers.bulkPut(customers);

      // Save last sync time
      await db.settings.put({
        key: "last_customer_sync",
        value: new Date().toISOString(),
      });

      return customers.length;
    } catch (error) {
      console.error("Customer Sync Failed", error);
      throw error;
    }
  }

  /**
   * Read customers from IndexedDB
   */
  async getOfflineCustomers(): Promise<Customer[]> {
    return await db.customers.toArray();
  }

  /**
   * Get last sync date
   */
  async getLastSync(): Promise<string | null> {
    const row = await db.settings.get("last_customer_sync");

    return row ? row.value : null;
  }

  /**
   * Number of cached customers
   */
  async getCustomerCount(): Promise<number> {
    return await db.customers.count();
  }
}

export default new CustomerSyncService();
