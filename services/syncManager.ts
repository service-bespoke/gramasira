import syncService from "./sync.service";
import { pendingReadingCount } from "@/offline/reading";

class SyncManager {
  private syncing = false;

  /**
   * Synchronize everything
   */
  async syncNow() {
    if (this.syncing) {
      console.log("Synchronization already running.");
      return;
    }

    if (!this.isOnline()) {
      console.log("Offline. Synchronization skipped.");
      return;
    }

    this.syncing = true;

    try {
      console.log("Starting Background Synchronization...");

      const result = await syncService.syncEverything();

      if (result.success) {
        localStorage.setItem("last_sync", new Date().toISOString());

        console.log(
          `Synchronization Completed | Synced : ${result.synced} | Failed : ${result.failed}`,
        );
      } else {
        console.log(result.message);
      }

      return result;
    } catch (err) {
      console.error("Synchronization Error", err);
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Pending Offline Readings
   */
  async pendingCount(): Promise<number> {
    return await pendingReadingCount();
  }

  /**
   * Last successful synchronization
   */
  lastSync(): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("last_sync");
  }

  /**
   * Is synchronization running?
   */
  isSyncing(): boolean {
    return this.syncing;
  }

  /**
   * Internet availability
   */
  isOnline(): boolean {
    if (typeof window === "undefined") return false;

    return navigator.onLine;
  }

  /**
   * Start Background Sync Engine
   */
  start(): void {
    if (typeof window === "undefined") return;

    console.log("Background Sync Engine Started");

    // First synchronization
    if (this.isOnline()) {
      this.syncNow();
    }

    // Synchronize whenever internet comes back
    window.addEventListener("online", () => {
      console.log("Internet Connected");

      this.syncNow();
    });

    // Notify when internet is lost
    window.addEventListener("offline", () => {
      console.log("Internet Disconnected");
    });

    // Automatic synchronization every 5 minutes
    setInterval(
      () => {
        if (this.isOnline()) {
          this.syncNow();
        }
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Stop synchronization
   * (Reserved for future use)
   */
  stop(): void {
    console.log("Sync Manager Stopped");
  }

  /**
   * Refresh pending count
   */
  async refreshPending(): Promise<number> {
    return await this.pendingCount();
  }
}

const syncManager = new SyncManager();

export default syncManager;
