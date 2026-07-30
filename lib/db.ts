import Dexie, { Table } from "dexie";

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

class WaterDB extends Dexie {
  readings!: Table<Reading>;

  constructor() {
    super("WaterBillingDB");

    this.version(1).stores({
      readings: "++id,customerId,synced,createdAt",
    });
  }
}

export const db = new WaterDB();
