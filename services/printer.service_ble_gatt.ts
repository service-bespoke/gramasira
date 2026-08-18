class PrinterService {
  private characteristic: any = null;
  private device: any = null;

  async connect() {
    if (this.characteristic) return;

    this.device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [0xffe0],
    });

    const server = await this.device.gatt!.connect();

    const service = await server.getPrimaryService(0xffe0);

    this.characteristic = await service.getCharacteristic(0xffe1);
  }

  async disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }

    this.characteristic = null;
  }

  async write(text: string) {
    if (!this.characteristic) {
      throw new Error("Printer not connected");
    }

    const encoder = new TextEncoder();

    await this.characteristic.writeValue(encoder.encode(text));
  }

  async printBill(bill: any) {
    if (!this.characteristic) {
      throw new Error("Printer not connected");
    }

    let txt = "";

    txt += "WATER BILL\n";
    txt += "-----------------------------\n";
    txt += `Bill No : ${bill.bill.bill_no}\n`;
    txt += `Consumer: ${bill.bill.consumer_no}\n`;
    txt += `Customer: ${bill.bill.customer_name}\n`;
    txt += "-----------------------------\n";
    txt += `Previous : ${bill.bill.previous_reading}\n`;
    txt += `Current  : ${bill.bill.current_reading}\n`;
    txt += `Units    : ${bill.bill.units}\n`;
    txt += "-----------------------------\n";
    txt += `Amount   : Rs ${bill.bill.total_amount}\n`;
    txt += "-----------------------------\n";
    txt += "Thank You\n\n\n\n";

    await this.write(txt);
  }
}

export default new PrinterService();
