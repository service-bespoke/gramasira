export interface CustomerImport {
  consumer_no: string;
  customer_name: string;
  address1: string;
  address2: string;
  address3: string;
  email: string;
  mobile: string;
  resolution_number: string;
  previous_reading: number;
  due_days: number;
  last_bill_no: string;
  death_fund: number;
  fine_percent: number;
}

export interface TariffImport {
  minimum_unit: number;
  maximum_unit: number;
  base_unit: number;
  base_unit_rate: number;
  fixed_charge: number;
  meter_charge: number;
  maintenance_charge: number;
}

export interface BillHistoryImport {
  consumer_no: string;
  bill_no: string;
  bill_date: string;
  bill_amount: number;
  bill_due_date: string;
  reading_value: number;
  payment_status: string;
}

export interface FundImport {
  fund_name: string;
  fund_rate: number;
  collection_type: string;
}

export interface ImportPreview {
  customers: CustomerImport[];
  tariffs: TariffImport[];
  bills: BillHistoryImport[];
  funds: FundImport[];
}


