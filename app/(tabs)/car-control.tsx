import { ConfigScreen } from '@/components/screens/config-screen';
import { ControlScreen } from '@/components/screens/control-screen';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useGyroscopeController } from '../../hooks/use-gyroscope-controller';
import { useBluetoothCommander } from '@/hooks/use-bluetooth-commander';
import { useBluetoothContext } from '@/contexts/bluetooth-context';

export default function CarControlScreen() {
  const controller = useGyroscopeController();
  const { state } = useBluetoothContext();

  // Automatically send Bluetooth commands when gyroscope is active and connected
  useBluetoothCommander(
    controller.data.throttle,
    controller.data.steeringAngle,
    controller.data.isActive
  );

  return (
    <View style={styles.container}>
      {!controller.data.isActive ? (
        <ConfigScreen
          config={controller.config}
          onConfigChange={controller.updateConfig}
          onActivate={controller.activate}
          bluetoothConnected={state.status === 'connected'}
        />
      ) : (
        <ControlScreen
          data={controller.data}
          onDeactivate={controller.deactivate}
          onCalibrateNeutral={controller.calibrateNeutral}
          bluetoothConnected={state.status === 'connected'}
          bluetoothStats={state.stats}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
