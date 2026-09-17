"use client";

import QRCode from "qrcode";

/* =========================================================
   PRINTER SERVICE
   Web Bluetooth BLE Thermal Printer
   ========================================================= */

class PrinterService {
  private device: any = null;
  private characteristic: any = null;
  private service: any = null;

  private serviceUuid: string | null = null;
  private characteristicUuid: string | null = null;

  /* =========================================================
     COMMON BLE THERMAL PRINTER UUIDS
  ========================================================= */

  private readonly SERVICE_UUIDS = [
    "0000ffe0-0000-1000-8000-00805f9b34fb",
    "000018f0-0000-1000-8000-00805f9b34fb",
    "0000ff00-0000-1000-8000-00805f9b34fb",

    "49535343-fe7d-4ae5-8fa9-9fafd205e455",
  ];

  private readonly CHARACTERISTIC_UUIDS = [
    "0000ffe1-0000-1000-8000-00805f9b34fb",

    "00002af1-0000-1000-8000-00805f9b34fb",

    "0000ff01-0000-1000-8000-00805f9b34fb",
    "0000ff02-0000-1000-8000-00805f9b34fb",

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

    if (this.isConnected()) {
      console.log("Printer already connected:", this.device?.name);

      return;
    }

    console.log("==========================================");

    console.log("Opening Bluetooth printer selector...");

    this.device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,

      optionalServices: [...this.SERVICE_UUIDS],
    });

    console.log("Selected Bluetooth device:", this.device?.name);

    console.log("Device ID:", this.device?.id);

    this.device.addEventListener("gattserverdisconnected", () => {
      console.log("Bluetooth printer disconnected.");

      this.characteristic = null;
      this.service = null;
      this.serviceUuid = null;
      this.characteristicUuid = null;
    });

    if (!this.device.gatt) {
      throw new Error(
        "This Bluetooth printer does not expose GATT. " +
          "It may be a Classic Bluetooth printer instead of BLE.",
      );
    }

    console.log("Connecting to printer GATT...");

    const server = await this.device.gatt.connect();

    console.log("GATT connected successfully.");

    await this.findWritableCharacteristic(server);

    if (!this.characteristic) {
      throw new Error(
        "Could not find a writable BLE characteristic on this printer.",
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
             * UUID does not exist.
             */
          }
        }

        /*
         * Inspect all characteristics.
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
     * Discover all primary services.
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
     * 20 bytes is safe for BLE thermal printers.
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
       * every BLE packet.
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
     ESC/POS QR CODE
     
     Uses:
       GS ( k

     QR Model:
       Model 2

     Error correction:
       Level M

     Size:
       6

     This sends an actual QR code to the
     thermal printer instead of printing
     the UPI URL as text.
  ========================================================= */

  /* =========================================================
     QR CODE AS RASTER IMAGE

     IMPORTANT:
     Do NOT use the printer's native QR command here.

     Many inexpensive BLE thermal printers accept ESC/POS text
     and bitmap data but do NOT implement GS ( k QR commands.

     We therefore:
       1. Generate the QR in the browser with the qrcode package.
       2. Render it to a canvas.
       3. Convert canvas pixels to 1-bit ESC/POS bitmap data.
       4. Send the bitmap in small BLE packets.

     This prints the actual QR image instead of the UPI URL.
  ========================================================= */

  private async printQRCode(data: string): Promise<void> {
    const qrText = String(data ?? "").trim();

    if (!qrText) {
      console.log("QR data is empty.");
      return;
    }

    console.log("Generating bitmap QR code:", qrText);

    if (typeof window === "undefined") {
      throw new Error("QR image generation requires a browser environment.");
    }

    /*
     * 58mm printers normally have 384 printable dots.
     * Keep the QR at 280 dots so it has a white margin around it.
     *
     * The canvas is square and includes a quiet zone.
     */
    const qrSize = 280;

    /*
     * Generate QR as a data URL.
     *
     * margin=4 is important for QR scanners.
     * errorCorrectionLevel=M gives a good balance between
     * reliability and physical QR size.
     */
    const dataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: qrSize,
      margin: 4,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    /*
     * Decode the generated PNG into an Image.
     */
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Could not decode generated QR image."));
      image.src = dataUrl;
    });

    /*
     * Draw to canvas.
     */
    const canvas = document.createElement("canvas");
    canvas.width = qrSize;
    canvas.height = qrSize;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) {
      throw new Error("Could not create canvas context for QR printing.");
    }

    /*
     * Force a clean white background.
     */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, qrSize, qrSize);

    ctx.drawImage(image, 0, 0, qrSize, qrSize);

    const imageData = ctx.getImageData(0, 0, qrSize, qrSize);

    /*
     * ESC/POS raster image command:
     *
     * GS v 0
     * 1D 76 30 00
     * xL xH yL yH
     * bitmap data
     *
     * One bit represents one horizontal dot.
     */
    const width = qrSize;
    const height = qrSize;

    const bytesPerRow = Math.ceil(width / 8);

    const bitmap = new Uint8Array(bytesPerRow * height);

    /*
     * Convert pixels to monochrome.
     *
     * QR black pixels become 1.
     * White pixels become 0.
     *
     * A threshold of 180 makes the conversion robust against
     * anti-aliased edges.
     */
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;

        const r = imageData.data[pixelIndex];

        const g = imageData.data[pixelIndex + 1];

        const b = imageData.data[pixelIndex + 2];

        const a = imageData.data[pixelIndex + 3];

        /*
         * Treat transparent pixels as white.
         */
        const gray = a === 0 ? 255 : 0.299 * r + 0.587 * g + 0.114 * b;

        if (gray < 180) {
          const byteIndex = y * bytesPerRow + Math.floor(x / 8);

          const bit = 7 - (x % 8);

          bitmap[byteIndex] |= 1 << bit;
        }
      }
    }

    /*
     * Build ESC/POS raster header.
     *
     * Width is measured in bytes.
     * Height is measured in dots.
     */
    const header = new Uint8Array([
      0x1d,
      0x76,
      0x30,
      0x00,

      bytesPerRow & 0xff,
      (bytesPerRow >> 8) & 0xff,

      height & 0xff,
      (height >> 8) & 0xff,
    ]);

    /*
     * Combine header + bitmap.
     */
    const output = new Uint8Array(header.length + bitmap.length);

    output.set(header, 0);
    output.set(bitmap, header.length);

    console.log("QR bitmap prepared:", {
      width,
      height,
      bytesPerRow,
      totalBytes: output.length,
    });

    /*
     * Send the bitmap.
     *
     * writeBytes() already breaks the data into 20-byte BLE
     * packets and waits between packets, which is important
     * for small BLE thermal printers.
     */
    await this.writeBytes(output);

    /*
     * Extra processing time for the printer's image buffer.
     */
    await this.sleep(500);

    console.log("QR bitmap sent to thermal printer.");
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

    const info = bill?.bill ?? {};

    const details = bill?.details ?? [];

    const funds = bill?.funds ?? [];

    console.log("Starting thermal print...");

    console.log("Bill information:", info);

    console.log("QR STRING:", info.qr_string);

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
          `${item.units ?? 0} x Rs ${this.money(item.rate)} = Rs ${this.money(
            item.amount,
          )}\n`,
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

    /* =======================================================
       PAYMENT STATUS
    ======================================================= */

    if (String(info.status ?? "").toLowerCase() === "paid") {
      await this.command(this.commands.CENTER);

      await this.command(this.commands.BOLD_ON);

      await this.write("**** PAID ****\n");

      await this.command(this.commands.BOLD_OFF);

      await this.command(this.commands.LEFT);
    }

    await this.write(`Due Date : ${info.due_date ?? ""}\n`);

    /*
     * Payment date if available.
     */

    if (info.payment_date) {
      await this.write(`Paid Date : ${info.payment_date}\n`);
    }

    await this.write("--------------------------------\n");

    /* =======================================================
       UPI QR CODE
       
       IMPORTANT:
       
       DO NOT PRINT qr_string AS TEXT.
       
       Instead send it to the printer's
       ESC/POS QR-code command.
    ======================================================= */

    if (info.qr_string && String(info.qr_string).trim() !== "") {
      await this.command(this.commands.CENTER);

      await this.command(this.commands.BOLD_ON);

      await this.write("SCAN & PAY USING UPI\n");

      await this.command(this.commands.BOLD_OFF);

      /*
       * ACTUAL QR CODE
       */

      await this.printQRCode(String(info.qr_string).trim());

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
