interface BluetoothDevice {
  gatt?: BluetoothRemoteGATTServer;
}

interface Bluetooth {
  requestDevice(options: any): Promise<BluetoothDevice>;
}

interface Navigator {
  bluetooth: Bluetooth;
}
