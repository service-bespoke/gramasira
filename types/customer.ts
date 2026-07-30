export interface Customer {
  customer_id: number;

  consumer_no: string;

  customer_name: string;

  address1?: string;

  address2?: string;

  address3?: string;

  mobile?: string;

  previous_reading: number;
}