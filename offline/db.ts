import Dexie, { Table } from "dexie";
import { Customer } from "@/types/customer";

/**
 * Offline Meter Reading
 */
export interface MeterReading {
  id?: number;

  customer_id: number;

  consumer_no?: string;

  customer_name?: string;

  previous_reading: number;

  current_reading: number;

  units: number;

  latitude?: number;

  longitude?: number;

  accuracy?: number;

  photo?: string;

  captured_at: string;

  device_time: string;

  status: "Pending" | "Synced";

  synced_at?: string;
}

/**
 * Offline Sync Queue
 */
export interface SyncQueue {
  id?: number;

  type: string;

  payload: string;

  status: "Pending" | "Processing" | "Completed";

  created_at: string;
}

/**
 * Offline Settings
 */
export interface Setting {
  key: string;

  value: string;
}

class WaterDB extends Dexie {
  customers!: Table<Customer, number>;

  readings!: Table<MeterReading, number>;

  syncQueue!: Table<SyncQueue, number>;

  settings!: Table<Setting, string>;

  constructor() {
    super("WaterBillingDB");

    /**
     * Version 2
     * (Upgrade from old "synced" field to new "status" field)
     */
    this.version(2).stores({
      customers: "customer_id,consumer_no,customer_name,mobile",

      readings: "++id,customer_id,status,captured_at",

      syncQueue: "++id,type,status,created_at",

      settings: "key",
    });
  }
}

export const db = new WaterDB();
