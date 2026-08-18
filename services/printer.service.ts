"use client";

/* =========================================================
   PRINTER SERVICE
   Web Bluetooth BLE Thermal Printer
   ========================================================= */

class PrinterService {
  private device: any = null;
  private characteristic: any = null;
  private service: any = null;

  /*
   * We keep the discovered UUIDs so we can see exactly
   * which service/characteristic the printer is using.
   */
  private serviceUuid: string | null = null;
  private characteristicUuid: string | null = null;

  /* =========================================================
     COMMON BLE THERMAL PRINTER UUIDS

     FFE0 / FFE1
     18F0 / 2AF1
     FF00 / FF01 / FF02

     Some printers use vendor-specific UUIDs.
     ========================================================= */

  private readonly SERVICE_UUIDS = [
    "0000ffe0-0000-1000-8000-00805f9b34fb",
    "000018f0-0000-1000-8000-00805f9b34fb",
    "0000ff00-0000-1000-8000-00805f9b34fb",

    /*
     * Common vendor BLE printer service
     */
    "49535343-fe7d-4ae5-8fa9-9fafd205e455",
  ];

  private readonly CHARACTERISTIC_UUIDS = [
    "0000ffe1-0000-1000-8000-00805f9b34fb",

    "00002af1-0000-1000-8000-00805f9b34fb",

    "0000ff01-0000-1000-8000-00805f9b34fb",
    "0000ff02-0000-1000-8000-00805f9b34fb",

    /*
     * Common vendor BLE printer characteristic
     */
    "49535343-8841-43f4-a8d4-ecbe34729bb3",
    "49535343-1e4d-4bd9-ba61-23c647249616",
  ];

  /* =========================================================
     WEB BLUETOOTH SUPPORT
     ========================================================= */

  isSupported(): boolean {
    return typeof window !== "undefined" && "bluetooth" in navigator;
  }

  /* =========================================================
     CONNECTION STATUS
     ========================================================= */

  isConnected(): boolean {
    return !!(
      this.device &&
      this.device.gatt &&
      this.device.gatt.connected &&
      this.characteristic
    );
  }

  /* =========================================================
     CONNECT
     ========================================================= */

  async connect(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error(
        "Web Bluetooth is not supported in this browser. " +
          "Please use Chrome on Android.",
      );
    }

    /*
     * Already connected
     */
    if (this.isConnected()) {
      console.log("Printer already connected:", this.device?.name);
      return;
    }

    console.log("==========================================");

    console.log("Opening Bluetooth printer selector...");

    /*
     * Ask browser for printer
     *
     * We use acceptAllDevices because the actual
     * printer UUID is not yet confirmed.
     */
    this.device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,

      optionalServices: [...this.SERVICE_UUIDS],
    });

    console.log("Selected Bluetooth device:", this.device?.name);

    console.log("Device ID:", this.device?.id);

    /*
     * Disconnect event
     */
    this.device.addEventListener("gattserverdisconnected", () => {
      console.log("Bluetooth printer disconnected.");

      this.characteristic = null;
      this.service = null;
      this.serviceUuid = null;
      this.characteristicUuid = null;
    });

    /*
     * Check GATT
     */
    if (!this.device.gatt) {
      throw new Error(
        "This Bluetooth printer does not expose GATT. " +
          "It may be a Classic Bluetooth printer instead of BLE.",
      );
    }

    /*
     * Connect
     */
    console.log("Connecting to printer GATT...");

    const server = await this.device.gatt.connect();

    console.log("GATT connected successfully.");

    /*
     * Try to discover the writable characteristic.
     */
    await this.findWritableCharacteristic(server);

    if (!this.characteristic) {
      throw new Error(
        "Could not find a writable BLE characteristic " + "on this printer.",
      );
    }

    console.log("==========================================");

    console.log("BLUETOOTH PRINTER CONNECTED");

    console.log("Printer:", this.device?.name);

    console.log("Service:", this.serviceUuid);

    console.log("Characteristic:", this.characteristicUuid);

    console.log("==========================================");
  }

  /* =========================================================
     FIND WRITABLE CHARACTERISTIC
     ========================================================= */

  private async findWritableCharacteristic(server: any): Promise<void> {
    console.log("Searching printer BLE services...");

    /*
     * -------------------------------------------------------
     * FIRST:
     * Try known service + characteristic combinations
     * -------------------------------------------------------
     */

    for (const serviceUuid of this.SERVICE_UUIDS) {
      try {
        console.log("Trying service:", serviceUuid);

        const service = await server.getPrimaryService(serviceUuid);

        console.log("Service found:", serviceUuid);

        /*
         * Try known characteristics
         */
        for (const characteristicUuid of this.CHARACTERISTIC_UUIDS) {
          try {
            console.log("Trying characteristic:", characteristicUuid);

            const characteristic =
              await service.getCharacteristic(characteristicUuid);

            if (this.isWritableCharacteristic(characteristic)) {
              this.service = service;

              this.characteristic = characteristic;

              this.serviceUuid = serviceUuid;

              this.characteristicUuid = characteristicUuid;

              console.log("Writable characteristic FOUND.");

              return;
            }
          } catch (error) {
            /*
             * This UUID simply does not exist
             * on this printer.
             */
          }
        }

        /*
         * ---------------------------------------------------
         * If known characteristic UUIDs failed,
         * inspect all characteristics in this service.
         * ---------------------------------------------------
         */

        try {
          const characteristics = await service.getCharacteristics();

          console.log("Characteristics found:", characteristics.length);

          for (const characteristic of characteristics) {
            console.log(
              "Characteristic:",
              characteristic.uuid,
              "properties:",
              characteristic.properties,
            );

            if (this.isWritableCharacteristic(characteristic)) {
              this.service = service;

              this.characteristic = characteristic;

              this.serviceUuid = serviceUuid;

              this.characteristicUuid = characteristic.uuid;

              console.log(
                "Writable characteristic FOUND:",
                characteristic.uuid,
              );

              return;
            }
          }
        } catch (error) {
          console.log("Could not enumerate characteristics:", error);
        }
      } catch (error) {
        console.log("Service not available:", serviceUuid);
      }
    }

    /*
     * -------------------------------------------------------
     * SECOND:
     * Try discovering all primary services that the browser
     * allows us to access.
     * -------------------------------------------------------
     */

    try {
      console.log("Trying complete primary service discovery...");

      const services = await server.getPrimaryServices();

      console.log("Primary services found:", services.length);

      for (const service of services) {
        console.log("Discovered service:", service.uuid);

        try {
          const characteristics = await service.getCharacteristics();

          for (const characteristic of characteristics) {
            console.log(
              "Discovered characteristic:",
              characteristic.uuid,
              characteristic.properties,
            );

            if (this.isWritableCharacteristic(characteristic)) {
              this.service = service;

              this.characteristic = characteristic;

              this.serviceUuid = service.uuid;

              this.characteristicUuid = characteristic.uuid;

              console.log(
                "Writable characteristic discovered:",
                characteristic.uuid,
              );

              return;
            }
          }
        } catch (error) {
          console.log("Unable to inspect service:", service.uuid);
        }
      }
    } catch (error) {
      console.log("Full service discovery unavailable:", error);
    }

    throw new Error(
      "No writable BLE characteristic was found. " +
        "The printer may use a different BLE protocol, " +
        "or it may be Classic Bluetooth instead of BLE.",
    );
  }

  /* =========================================================
     CHECK WRITABLE CHARACTERISTIC
     ========================================================= */

  private isWritableCharacteristic(characteristic: any): boolean {
    if (!characteristic) {
      return false;
    }

    const properties = characteristic.properties || {};

    return !!(properties.write || properties.writeWithoutResponse);
  }

  /* =========================================================
     DISCONNECT
     ========================================================= */

  disconnect(): void {
    console.log("Disconnecting printer...");

    try {
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect();
      }
    } catch (error) {
      console.error("Printer disconnect error:", error);
    }

    this.device = null;
    this.characteristic = null;
    this.service = null;

    this.serviceUuid = null;
    this.characteristicUuid = null;

    console.log("Printer disconnected.");
  }

  /* =========================================================
     WRITE RAW BYTES
     ========================================================= */

  private async writeBytes(data: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error("Printer is not connected.");
    }

    /*
     * 20 bytes is the safest starting point
     * for BLE thermal printers.
     *
     * We can increase this later after testing.
     */
    const CHUNK_SIZE = 20;

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);

      try {
        if (
          typeof this.characteristic.writeValueWithoutResponse === "function" &&
          this.characteristic.properties?.writeWithoutResponse
        ) {
          await this.characteristic.writeValueWithoutResponse(chunk);
        } else {
          await this.characteristic.writeValue(chunk);
        }
      } catch (error) {
        console.error("BLE write failed:", error);

        throw new Error("Failed to send data to thermal printer.");
      }

      /*
       * Give printer time to process
       * each BLE packet.
       */
      await this.sleep(30);
    }
  }

  /* =========================================================
     WRITE TEXT
     ========================================================= */

  async write(text: string): Promise<void> {
    const encoder = new TextEncoder();

    const data = encoder.encode(text);

    await this.writeBytes(data);
  }

  /* =========================================================
     ESC/POS COMMANDS
     ========================================================= */

  private commands = {
    INIT: new Uint8Array([0x1b, 0x40]),

    CENTER: new Uint8Array([0x1b, 0x61, 0x01]),

    LEFT: new Uint8Array([0x1b, 0x61, 0x00]),

    RIGHT: new Uint8Array([0x1b, 0x61, 0x02]),

    BOLD_ON: new Uint8Array([0x1b, 0x45, 0x01]),

    BOLD_OFF: new Uint8Array([0x1b, 0x45, 0x00]),

    DOUBLE_SIZE: new Uint8Array([0x1d, 0x21, 0x11]),

    NORMAL_SIZE: new Uint8Array([0x1d, 0x21, 0x00]),

    CUT: new Uint8Array([0x1d, 0x56, 0x00]),
  };

  /* =========================================================
     SEND COMMAND
     ========================================================= */

  private async command(command: Uint8Array): Promise<void> {
    await this.writeBytes(command);
  }

  /* =========================================================
     MONEY FORMAT
     ========================================================= */

  private money(value: any): string {
    const number = Number(value ?? 0);

    return number.toFixed(2);
  }

  /* =========================================================
     PRINT BILL
     ========================================================= */

  async printBill(bill: any): Promise<void> {
    /*
     * Automatically connect if required.
     */
    if (!this.isConnected()) {
      await this.connect();
    }

    if (!this.characteristic) {
      throw new Error("Printer connection failed.");
    }

    const info = bill.bill;

    const details = bill.details ?? [];

    const funds = bill.funds ?? [];

    console.log("Starting thermal print...");

    /* =======================================================
       INITIALIZE
       ======================================================= */

    await this.command(this.commands.INIT);

    /* =======================================================
       HEADER
       ======================================================= */

    await this.command(this.commands.CENTER);

    await this.command(this.commands.BOLD_ON);

    await this.command(this.commands.DOUBLE_SIZE);

    await this.write("GRAMASIRA\n");

    await this.command(this.commands.NORMAL_SIZE);

    await this.write("Water Supply Scheme\n");

    await this.command(this.commands.BOLD_OFF);

    await this.write("Computer Generated Receipt\n");

    await this.write("--------------------------------\n");

    /* =======================================================
       BILL DETAILS
       ======================================================= */

    await this.command(this.commands.LEFT);

    await this.write(`Bill No   : ${info.bill_no ?? ""}\n`);

    await this.write(`Consumer  : ${info.consumer_no ?? ""}\n`);

    await this.write(`Name      : ${info.customer_name ?? ""}\n`);

    await this.write(`Month     : ${info.bill_month ?? ""}\n`);

    await this.write("--------------------------------\n");

    /* =======================================================
       METER READING
       ======================================================= */

    await this.command(this.commands.BOLD_ON);

    await this.write("METER READING\n");

    await this.command(this.commands.BOLD_OFF);

    await this.write(`Previous  : ${info.previous_reading ?? 0}\n`);

    await this.write(`Current   : ${info.current_reading ?? 0}\n`);

    await this.write(`Units     : ${info.units ?? 0}\n`);

    await this.write("--------------------------------\n");

    /* =======================================================
       CONSUMPTION CHARGES
       ======================================================= */

    if (details.length > 0) {
      await this.command(this.commands.BOLD_ON);

      await this.write("CONSUMPTION CHARGES\n");

      await this.command(this.commands.BOLD_OFF);

      for (const item of details) {
        await this.write(
          `${item.slab_from ?? ""}-${item.slab_to ?? ""} Litres\n`,
        );

        await this.write(
          `${item.units ?? 0} x Rs ${this.money(item.rate)} = Rs ${this.money(item.amount)}\n`,
        );
      }

      await this.write("--------------------------------\n");
    }

    /* =======================================================
       ADDITIONAL FUNDS
       ======================================================= */

    if (funds.length > 0) {
      await this.command(this.commands.BOLD_ON);

      await this.write("ADDITIONAL FUNDS\n");

      await this.command(this.commands.BOLD_OFF);

      for (const item of funds) {
        await this.write(
          `${item.fund_name ?? ""} : Rs ${this.money(item.amount)}\n`,
        );
      }

      await this.write("--------------------------------\n");
    }

    /* =======================================================
       CHARGES
       ======================================================= */

    await this.write(`Water Charge : Rs ${this.money(info.water_charge)}\n`);

    await this.write(`Fixed Charge : Rs ${this.money(info.fixed_charge)}\n`);

    await this.write(`Meter Charge : Rs ${this.money(info.meter_charge)}\n`);

    await this.write(
      `Maintenance  : Rs ${this.money(info.maintenance_charge)}\n`,
    );

    await this.write(`Penalty      : Rs ${this.money(info.penalty)}\n`);

    await this.write(`Discount     : Rs ${this.money(info.discount)}\n`);

    await this.write("--------------------------------\n");

    /* =======================================================
       TOTAL
       ======================================================= */

    await this.command(this.commands.BOLD_ON);

    await this.command(this.commands.DOUBLE_SIZE);

    await this.write(`TOTAL: Rs ${this.money(info.total_amount)}\n`);

    await this.command(this.commands.NORMAL_SIZE);

    await this.command(this.commands.BOLD_OFF);

    await this.write(`Due Date : ${info.due_date ?? ""}\n`);

    await this.write("--------------------------------\n");

    /* =======================================================
       UPI
       ======================================================= */

    if (info.qr_string) {
      await this.command(this.commands.CENTER);

      await this.command(this.commands.BOLD_ON);

      await this.write("SCAN & PAY USING UPI\n");

      await this.command(this.commands.BOLD_OFF);

      /*
       * At this stage we print the UPI string.
       *
       * We are NOT sending the QR image yet.
       */
      await this.write(`${info.qr_string}\n`);

      await this.write("\n");
    }

    /* =======================================================
       FOOTER
       ======================================================= */

    await this.command(this.commands.CENTER);

    await this.write("Thank You\n");

    await this.command(this.commands.BOLD_ON);

    await this.write("Gramasira Water Supply\n");

    await this.command(this.commands.BOLD_OFF);

    /* =======================================================
       FEED PAPER
       ======================================================= */

    await this.write("\n\n\n\n");

    /* =======================================================
       CUT PAPER
       ======================================================= */

    /*
     * SP-POS891ED may or may not have a cutter.
     *
     * We don't allow a cutter error to make the
     * complete print operation appear failed.
     */
    try {
      await this.command(this.commands.CUT);
    } catch (error) {
      console.log("Printer cutter command not supported.");
    }

    console.log("Thermal receipt sent successfully.");
  }

  /* =========================================================
     GET DEBUG INFORMATION
     ========================================================= */

  getPrinterInfo(): any {
    return {
      connected: this.isConnected(),

      name: this.device?.name ?? null,

      id: this.device?.id ?? null,

      serviceUuid: this.serviceUuid,

      characteristicUuid: this.characteristicUuid,
    };
  }

  /* =========================================================
     DELAY
     ========================================================= */

  private sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

/* =========================================================
   SINGLE PRINTER INSTANCE
   ========================================================= */

const printerService = new PrinterService();

export default printerService;
