import { BluetoothState, BluetoothStats, CarCommand, ConnectionStatus, StrippedDevice } from '@/types/bluetooth';
import { requestAccessFineLocationPermission } from '@/utils/android-permissions';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from 'react-native-bluetooth-classic';

export interface UseBluetoothReturn {
  state: BluetoothState;
  startScan: () => Promise<void>;
  connect: (device: StrippedDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: CarCommand) => Promise<boolean>;
  isReady: boolean;
}

const INITIAL_STATS: BluetoothStats = {
  bytesSent: 0,
  commandsSent: 0,
  lastCommandAt: null,
  connectionTime: null,
};

export function useBluetooth(): UseBluetoothReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState<BluetoothStats>(INITIAL_STATS);
  const [isReady, setIsReady] = useState(false);

  const subscriptionsRef = useRef<BluetoothEventSubscription[]>([]);
  const lastCommandRef = useRef<CarCommand | null>(null);
  const commandQueueRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Bluetooth
  useEffect(() => {
    const subscriptions: BluetoothEventSubscription[] = [];

    const initBluetooth = async () => {
      try {
        const available = await RNBluetoothClassic.isBluetoothAvailable();
        console.debug('[Bluetooth] Available:', available);
        
        if (!available) {
          Alert.alert(
            'Bluetooth não disponível',
            'Este dispositivo não suporta Bluetooth Classic.'
          );
          return;
        }

        // Set up event listeners
        subscriptions.push(
          RNBluetoothClassic.onBluetoothEnabled(() => {
            console.debug('[Bluetooth] Enabled');
            setIsReady(true);
          })
        );

        subscriptions.push(
          RNBluetoothClassic.onBluetoothDisabled(() => {
            console.debug('[Bluetooth] Disabled');
            setIsReady(false);
            setStatus('disconnected');
            setConnectedDevice(null);
          })
        );

        subscriptions.push(
          RNBluetoothClassic.onDeviceConnected(async (event) => {
            console.debug('[Bluetooth] Device connected:', event.device.address);
            try {
              const device = await RNBluetoothClassic.getConnectedDevice(
                event.device.address
              );
              if (device) {
                setConnectedDevice(device);
                setStatus('connected');
                setStats((prev) => ({
                  ...prev,
                  connectionTime: Date.now(),
                }));
              }
            } catch (error) {
              console.error('[Bluetooth] Error getting connected device:', error);
            }
          })
        );

        subscriptions.push(
          RNBluetoothClassic.onDeviceDisconnected((event) => {
            console.debug('[Bluetooth] Device disconnected:', event.device.address);
            setConnectedDevice(null);
            setStatus('disconnected');
            setDevices([]);
            setStats(INITIAL_STATS);
          })
        );

        subscriptions.push(
          RNBluetoothClassic.onError((error) => {
            console.error('[Bluetooth] Error:', error);
            Alert.alert('Erro Bluetooth', error.message);
          })
        );

        subscriptionsRef.current = subscriptions;

        // Request Android permissions if needed
        if (Platform.OS === 'android') {
          await requestAccessFineLocationPermission();
        }

        // Check if already enabled
        const enabled = await RNBluetoothClassic.isBluetoothEnabled();
        setIsReady(enabled);
      } catch (error) {
        console.error('[Bluetooth] Initialization error:', error);
      }
    };

    initBluetooth();

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.remove());
      if (commandQueueRef.current) {
        clearInterval(commandQueueRef.current);
      }
    };
  }, []);

  const startScan = async (): Promise<void> => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();

      if (!enabled) {
        if (Platform.OS === 'android') {
          await RNBluetoothClassic.requestBluetoothEnabled();
        } else {
          Alert.alert(
            'Bluetooth Desativado',
            'Por favor, ative o Bluetooth nas Configurações para continuar.'
          );
          return;
        }
      }

      if (Platform.OS === 'android') {
        const granted = await requestAccessFineLocationPermission();
        if (!granted) {
          Alert.alert(
            'Permissão Necessária',
            'Permissão de localização é necessária para descoberta Bluetooth.'
          );
          return;
        }
      }

      setIsScanning(true);
      setStatus('scanning');
      console.debug('[Bluetooth] Starting discovery...');

      // Get bonded devices first
      const bonded = await RNBluetoothClassic.getBondedDevices();
      console.debug(`[Bluetooth] Found ${bonded.length} bonded devices`);

      if (Platform.OS === 'android') {
        // Start discovery for unpaired devices (Android only)
        const unpaired = await RNBluetoothClassic.startDiscovery();
        console.debug(`[Bluetooth] Found ${unpaired.length} unpaired devices`);
        setDevices([...bonded, ...unpaired]);
      } else {
        setDevices(bonded);
      }

      setIsScanning(false);
      setStatus('disconnected');
    } catch (error) {
      console.error('[Bluetooth] Error during scan:', error);
      setIsScanning(false);
      setStatus('disconnected');
      Alert.alert('Erro de Busca', 'Falha ao buscar dispositivos');
    }
  };

  const connect = async (device: StrippedDevice): Promise<void> => {
    try {
      setStatus('connecting');
      console.debug(`[Bluetooth] Connecting to ${device.address}...`);

      // Find the full device object
      const fullDevice = devices.find((d) => d.address === device.address);
      if (!fullDevice) {
        throw new Error('Dispositivo não encontrado');
      }

      const connected = await fullDevice.connect();

      if (connected) {
        console.debug(`[Bluetooth] Successfully connected to ${device.address}`);
        setConnectedDevice(fullDevice);
        setStatus('connected');
        setStats((prev) => ({
          ...prev,
          connectionTime: Date.now(),
        }));
      } else {
        throw new Error('Falha na conexão');
      }
    } catch (error) {
      console.error('[Bluetooth] Error connecting to device:', error);
      setStatus('disconnected');
      Alert.alert('Erro de Conexão', 'Falha ao conectar ao dispositivo');
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      if (connectedDevice) {
        console.debug(
          `[Bluetooth] Disconnecting from ${connectedDevice.address}...`
        );
        await connectedDevice.disconnect();
        setConnectedDevice(null);
        setStatus('disconnected');
        setDevices([]);
        setStats(INITIAL_STATS);
        lastCommandRef.current = null;
      }
    } catch (error) {
      console.error('[Bluetooth] Error disconnecting:', error);
      Alert.alert('Erro de Desconexão', 'Falha ao desconectar do dispositivo');
    }
  };

  const sendCommand = async (command: CarCommand): Promise<boolean> => {
    try {
      if (!connectedDevice) {
        console.warn('[Bluetooth] No device connected');
        return false;
      }

      // Check if command is different from last one (state comparison)
      if (
        lastCommandRef.current &&
        lastCommandRef.current.throttle === command.throttle &&
        lastCommandRef.current.steeringAngle === command.steeringAngle
      ) {
        // Command unchanged, skip sending
        return true;
      }

      // Format command: "T<throttle>:S<angle>\n"
      // Example: "T75:S90\n" (throttle 75%, steering 90°)
      const commandStr = `T${command.throttle}:S${command.steeringAngle}\n`;

      console.debug(`[Bluetooth] Sending command: ${commandStr.trim()}`);
      const written = await connectedDevice.write(commandStr);

      lastCommandRef.current = command;
      setStats((prev) => ({
        ...prev,
        bytesSent: prev.bytesSent + written,
        commandsSent: prev.commandsSent + 1,
        lastCommandAt: Date.now(),
      }));

      return true;
    } catch (error) {
      console.error('[Bluetooth] Error sending command:', error);
      return false;
    }
  };

  return {
    state: {
      status,
      devices,
      connectedDevice,
      isScanning,
      stats,
    },
    startScan,
    connect,
    disconnect,
    sendCommand,
    isReady,
  };
}

