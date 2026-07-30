import { getCustomers } from "@/services/customer.service";
import { saveCustomers } from "./customer";

export async function syncCustomers() {
  try {

    const customers = await getCustomers();

    await saveCustomers(customers);

    return true;

  } catch (err) {

    console.error(err);

    return false;

  }
}