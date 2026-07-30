import { db, MeterReading } from "./db";

/**
 * Save meter reading
 */
export async function saveReading(reading: MeterReading): Promise<number> {
  return await db.readings.add(reading);
}

/**
 * Get all readings
 */
export async function getAllReadings(): Promise<MeterReading[]> {
  return await db.readings.orderBy("captured_at").reverse().toArray();
}

/**
 * Get pending readings
 */
export async function getPendingReadings(): Promise<MeterReading[]> {
  return await db.readings.where("status").equals("Pending").toArray();
}

/**
 * Get single reading
 */
export async function getReading(
  id: number,
): Promise<MeterReading | undefined> {
  return await db.readings.get(id);
}

/**
 * Update reading
 */
export async function updateReading(
  id: number,
  data: Partial<MeterReading>,
): Promise<number> {
  return await db.readings.update(id, data);
}

/**
 * Delete reading
 */
export async function deleteReading(id: number): Promise<void> {
  await db.readings.delete(id);
}

/**
 * Mark synced
 */
export async function markReadingSynced(id: number): Promise<number> {
  return await db.readings.update(id, {
    status: "Synced",
    synced_at: new Date().toISOString(),
  });
}

/**
 * Remove synced readings
 */
export async function clearSyncedReadings() {
  const synced = await db.readings.where("status").equals("Synced").toArray();

  for (const row of synced) {
    if (row.id) {
      await db.readings.delete(row.id);
    }
  }
}

/**
 * Pending count
 */
export async function pendingReadingCount(): Promise<number> {
  return await db.readings.where("status").equals("Pending").count();
}
