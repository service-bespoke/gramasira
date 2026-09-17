import { api } from "./api";

/* =========================================================
   TYPES
========================================================= */

export interface OutstandingBill {
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
  discount: number;
  penalty: number;

  total_amount: number;

  due_date: string;
  status: string;

  qr_string?: string;
}

export interface OutstandingBillUpdate {
  bill_id: number;

  water_charge: number;
  fixed_charge: number;
  meter_charge: number;
  maintenance_charge: number;

  arrears: number;
  discount: number;
}

export interface PaymentPreview {
  bill_id: number;
  bill_no?: string;

  bill_amount: number;
  penalty: number;
  total_amount: number;

  payment_date: string;
  due_date: string;
  status?: string;
}

export interface PaymentPayload {
  bill_id: number;

  payment_date: string;

  amount: number;

  payment_method: string;

  reference_no?: string;

  remarks?: string;
}

/* =========================================================
   BILL SERVICE
========================================================= */

const billService = {
  /* =======================================================
     EXPORT BILLS TO EXCEL
  ======================================================= */

  exportExcel(from: string, to: string) {
    window.open(
      `/api/billing/exportExcel?from=${encodeURIComponent(
        from,
      )}&to=${encodeURIComponent(to)}`,
      "_blank",
    );
  },

  /* =======================================================
     PENDING READINGS
  ======================================================= */

  async pendingReadings() {
    const res = await api.get("/billing/pendingReadings");

    return res.data.data ?? [];
  },

  /* =======================================================
     BILL PREVIEW
  ======================================================= */

  async preview(reading_id: number) {
    const res = await api.get(`/billing/preview/${reading_id}`);

    return res.data.data ?? res.data;
  },

  /* =======================================================
     AVAILABLE FUNDS
  ======================================================= */

  async availableFunds() {
    const res = await api.get("/billing/funds");

    return res.data.data ?? [];
  },

  /* =======================================================
     GENERATE BILL
  ======================================================= */

  async generateBill(reading_id: number, funds: number[] = []) {
    const res = await api.post("/billing/generate", {
      reading_id,
      funds,
    });

    return res.data;
  },

  /* =======================================================
     GENERATED BILLS
  ======================================================= */

  async generatedBills() {
    const res = await api.get("/billing");

    return res.data.data ?? [];
  },

  /* =======================================================
     SINGLE BILL
  ======================================================= */

  async getBill(bill_id: number) {
    const res = await api.get(`/billing/view/${bill_id}`);

    return res.data.data ?? res.data;
  },

  /* =======================================================
     ALIAS
  ======================================================= */

  async viewBill(bill_id: number) {
    return this.getBill(bill_id);
  },

  /* =======================================================
     OUTSTANDING BILLS

     Returns only unpaid / pending bills.
  ======================================================= */

  async getOutstanding(search: string = "") {
    const res = await api.get("/billing/outstanding", {
      params: {
        search,
      },
    });

    return res.data.data ?? [];
  },

  /* =======================================================
     SINGLE OUTSTANDING BILL

     Used when opening/editing an outstanding bill.
  ======================================================= */

  async getOutstandingBill(bill_id: number) {
    const res = await api.get(`/billing/outstandingView/${bill_id}`);

    return res.data.data ?? res.data;
  },

  /* =======================================================
     OUTSTANDING BILL PREVIEW

     Calculates modified charges WITHOUT saving.
  ======================================================= */

  async previewOutstandingBill(data: OutstandingBillUpdate) {
    const res = await api.post("/billing/outstandingPreview", data);

    return res.data.data ?? res.data;
  },

  /* =======================================================
     UPDATE OUTSTANDING BILL

     Saves modified charges.

     This does NOT modify:
       - meter reading
       - units
       - payment
       - payment status

     It modifies only:
       - water charge
       - fixed charge
       - meter charge
       - maintenance charge
       - arrears
       - discount
  ======================================================= */

  async updateOutstandingBill(data: OutstandingBillUpdate) {
    const res = await api.post("/billing/outstandingUpdate", data);

    return res.data;
  },

  /* =======================================================
     PAYMENT PREVIEW

     IMPORTANT

     Backend API:

       POST /billing/paymentPreview

     Request body:

       {
         bill_id,
         payment_date
       }

     This calculates the penalty for the selected
     payment date WITHOUT saving the payment.
  ======================================================= */

  async paymentPreview(
    bill_id: number,
    payment_date?: string,
  ): Promise<PaymentPreview> {
    const res = await api.post("/billing/paymentPreview", {
      bill_id,
      payment_date: payment_date || new Date().toISOString().slice(0, 10),
    });

    return res.data.data ?? res.data;
  },

  /* =======================================================
     RECEIVE FULL PAYMENT

     Partial payment is NOT supported.

     The backend calculates the final payable amount:

       bill amount + penalty

     The amount sent here must exactly match that
     calculated amount.
  ======================================================= */

  async savePayment(data: PaymentPayload) {
    const res = await api.post("/billing/payment", data);

    return res.data;
  },

  /* =======================================================
     PAYMENT ALIAS

     Easier to use from payment screens.
  ======================================================= */

  async receivePayment(data: PaymentPayload) {
    return this.savePayment(data);
  },

  /* =======================================================
     PAID BILLS
  ======================================================= */

  async paidBills() {
    const res = await api.get("/billing/paid");

    return res.data.data ?? [];
  },

  /* =======================================================
     PAYMENT HISTORY
  ======================================================= */

  async paymentHistory(bill_id: number) {
    const res = await api.get(`/billing/paymentHistory/${bill_id}`);

    return res.data.data ?? [];
  },

  /* =======================================================
     THERMAL RECEIPT DATA

     Used by ThermalReceipt component.
  ======================================================= */

  async thermalReceipt(bill_id: number) {
    const res = await api.get(`/billing/thermal/${bill_id}`);

    return res.data.data ?? res.data;
  },

  /* =======================================================
     THERMAL RECEIPT URL
  ======================================================= */

  thermalUrl(bill_id: number) {
    return `/api/billing/thermal/${bill_id}`;
  },

  /* =======================================================
     BILL RECEIPT

     Alias for thermal receipt data.
  ======================================================= */

  async receipt(bill_id: number) {
    return this.thermalReceipt(bill_id);
  },
};

/* =========================================================
   EXPORT
========================================================= */

export default billService;
