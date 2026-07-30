import { api } from "./api";

const billService = {
  /*
   * Export Bills to Excel
   */
  exportExcel(from: string, to: string) {
    window.open(`/api/billing/exportExcel?from=${from}&to=${to}`, "_blank");
  },

  /*
   * Pending Readings
   */
  async pendingReadings() {
    const res = await api.get("/billing/pendingReadings");
    return res.data.data ?? [];
  },

  /*
   * Bill Preview
   */
  async preview(reading_id: number) {
    const res = await api.get(`/billing/preview/${reading_id}`);
    return res.data.data;
  },

  /*
   * Available Funds
   */
  async availableFunds() {
    const res = await api.get("/billing/funds");
    return res.data.data ?? [];
  },

  /*
   * Generate Bill
   */
  async generateBill(reading_id: number, funds: number[] = []) {
    const res = await api.post("/billing/generate", {
      reading_id,
      funds,
    });

    return res.data;
  },

  /*
   * Generated Bills
   */
  async generatedBills() {
    const res = await api.get("/billing");
    return res.data.data ?? [];
  },

  /*
   * Single Bill
   */
  async getBill(bill_id: number) {
    const res = await api.get(`/billing/view/${bill_id}`);
    return res.data.data;
  },

  /*
   * Alias
   */
  async viewBill(bill_id: number) {
    return this.getBill(bill_id);
  },
};

export default billService;
