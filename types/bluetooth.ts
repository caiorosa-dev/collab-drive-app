import { BluetoothDevice } from 'react-native-bluetooth-classic';

export interface DeviceConnection {
  device: BluetoothDevice;
  connected: boolean;
}

export interface StrippedDevice {
  name: string;
  address: string;
  id: string;
  bonded?: boolean;
}

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected';

export interface BluetoothStats {
  bytesSent: number;
  commandsSent: number;
  lastCommandAt: number | null;
  connectionTime: number | null;
}

export interface CarCommand {
  throttle: number;
  steeringAngle: number;
}

export interface BluetoothState {
  status: ConnectionStatus;
  devices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  isScanning: boolean;
  stats: BluetoothStats;
}