import { api } from "./api";

export async function getCustomersForReading() {
  const response = await api.get("/readings/customers");

  return response.data.data.map((item: any) => ({
    customer_id: Number(item.customer_id),

    consumer_no: item.consumer_no ?? "",

    customer_name: item.customer_name ?? "",

    mobile: item.mobile ?? "",

    address1: item.address1 ?? "",

    address2: item.address2 ?? "",

    address3: item.address3 ?? "",

    previous_reading: Number(item.previous_reading ?? 0),
  }));
}

export async function getCustomer(id: number) {
  const response = await api.get(`/readings/customer/${id}`);

  const item = response.data.data;

  return {
    customer_id: Number(item.customer_id),

    consumer_no: item.consumer_no ?? "",

    customer_name: item.customer_name ?? "",

    mobile: item.mobile ?? "",

    address1: item.address1 ?? "",

    address2: item.address2 ?? "",

    address3: item.address3 ?? "",

    previous_reading: Number(item.previous_reading ?? 0),
  };
}

export async function saveReading(data: any) {
  const response = await api.post("/readings/save", data);

  return response.data;
}
