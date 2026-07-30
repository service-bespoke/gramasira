export interface PendingReading {
  reading_id: number;
  customer_id: number;

  consumer_no: string;
  customer_name: string;

  previous_reading: number;
  current_reading: number;
  units: number;

  billing_month: string;
}

export interface Bill {
  bill_id: number;

  bill_no: string;

  customer_id: number;

  consumer_no: string;

  customer_name: string;

  bill_month: string;

  previous_reading: number;

  current_reading: number;

  units: number;

  water_charge: number;

  fixed_charge: number;

  meter_charge: number;

  maintenance_charge: number;

  arrears: number;

  penalty: number;

  discount: number;

  total_amount: number;

  due_date: string;

  status: "Pending" | "Paid";
}

export interface BillDetail {
  detail_id: number;

  bill_id: number;

  slab_from: number;

  slab_to: number;

  units: number;

  rate: number;

  amount: number;
}
