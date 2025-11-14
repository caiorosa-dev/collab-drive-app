import { CarCommand } from '@/types/bluetooth';
import { useEffect, useRef } from 'react';
import { useBluetoothContext } from '@/contexts/bluetooth-context';

/**
 * Hook that sends Bluetooth commands at a throttled rate (every 100ms)
 * Only sends commands when the state has changed from the previous command
 */
export function useBluetoothCommander(
  throttle: number,
  steeringAngle: number,
  isActive: boolean
) {
  const { sendCommand, state } = useBluetoothContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const commandRef = useRef<CarCommand>({ throttle: 0, steeringAngle: 90 });

  useEffect(() => {
    // Only run if we're connected and active
    if (state.status !== 'connected' || !isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up 100ms interval for sending commands
    intervalRef.current = setInterval(() => {
      const currentCommand: CarCommand = {
        throttle,
        steeringAngle,
      };

      // Only send if command has changed
      if (
        commandRef.current.throttle !== currentCommand.throttle ||
        commandRef.current.steeringAngle !== currentCommand.steeringAngle
      ) {
        sendCommand(currentCommand);
        commandRef.current = currentCommand;
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [throttle, steeringAngle, isActive, sendCommand, state.status]);

  // Send stop command when deactivating
  useEffect(() => {
    if (!isActive && state.status === 'connected') {
      sendCommand({ throttle: 0, steeringAngle: 90 });
    }
  }, [isActive, sendCommand, state.status]);
}

