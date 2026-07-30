export interface Reading {
  id?: number;
  customerId: number;
  customerName: string;
  meterNo: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  remarks: string;
  synced: boolean;
  createdAt: string;
}
