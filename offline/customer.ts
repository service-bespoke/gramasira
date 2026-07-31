import { db } from "./db";
import type { Customer } from "@/types/customer";

/**
 * Save all customers to IndexedDB
 */
export async function saveCustomers(customers: Customer[]) {
  // Remove old customers
  await db.customers.clear();

  // Insert new customers
  await db.customers.bulkPut(customers);
}

/**
 * Get all customers
 */
export async function getCustomers() {
  return await db.customers.orderBy("customer_name").toArray();
}

/**
 * Get one customer
 */
export async function getCustomer(customer_id: number) {
  return await db.customers.get(customer_id);
}

/**
 * Search customer
 */
export async function searchCustomers(keyword: string) {
  const all = await db.customers.toArray();

  const search = keyword.toLowerCase();

  return all.filter(
    (c) =>
      c.customer_name?.toLowerCase().includes(search) ||
      c.consumer_no?.toLowerCase().includes(search) ||
      c.mobile?.toLowerCase().includes(search),
  );
}

/**
 * Delete all customers
 */
export async function deleteCustomers() {
  await db.customers.clear();
}

/**
 * Total customer count
 */
export async function customerCount() {
  return await db.customers.count();
}
