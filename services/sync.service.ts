import { api } from "./api";
import { getPendingReadings, markReadingSynced } from "@/offline/reading";

/**
 * Common return type for all synchronization methods
 */
export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  message?: string;
}

class SyncService {
  private syncing = false;

  /**
   * Check whether synchronization is running
   */
  isSyncing(): boolean {
    return this.syncing;
  }

  /**
   * Synchronize all pending meter readings
   */
  async syncReadings(): Promise<SyncResult> {
    if (this.syncing) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        message: "Synchronization already running.",
      };
    }

    this.syncing = true;

    try {
      const pending = await getPendingReadings();

      if (pending.length === 0) {
        return {
          success: true,
          synced: 0,
          failed: 0,
          message: "No pending readings.",
        };
      }

      let synced = 0;
      let failed = 0;

      for (const reading of pending) {
        try {
          const response = await api.post("/readings/save", {
            customer_id: reading.customer_id,
            current_reading: reading.current_reading,

            latitude: reading.latitude,
            longitude: reading.longitude,
            accuracy: reading.accuracy,

            captured_at: reading.captured_at,
            device_time: reading.device_time,

            photo: reading.photo,
          });

          if (
            response.data &&
            (response.data.status === true ||
              response.data.success === true)
          ) {
            if (reading.id) {
              await markReadingSynced(reading.id);
            }

            synced++;
          } else {
            failed++;
          }
        } catch (err) {
          console.error("Reading Sync Failed", err);
          failed++;
        }
      }

      return {
        success: failed === 0,
        synced,
        failed,
        message:
          failed === 0
            ? "Synchronization completed successfully."
            : "Synchronization completed with some failures.",
      };
    } catch (err) {
      console.error("Synchronization Error", err);

      return {
        success: false,
        synced: 0,
        failed: 0,
        message: "Unexpected synchronization error.",
      };
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Master synchronization method
   * Future:
   *  - Customers
   *  - Tariff
   *  - Settings
   *  - Funds
   */
  async syncEverything(): Promise<SyncResult> {
    if (typeof window !== "undefined" && !navigator.onLine) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        message: "Offline",
      };
    }

    // Step 1
    const readingResult = await this.syncReadings();

    /*
    Future Steps

    await this.syncCustomers();

    await this.syncTariff();

    await this.syncSettings();

    await this.syncFunds();
    */

    return readingResult;
  }

  /**
   * Start automatic synchronization
   */
  startAutoSync(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      console.log("Internet Connected. Starting Background Sync...");
      this.syncEverything();
    });
  }
}

const syncService = new SyncService();

export default syncService;