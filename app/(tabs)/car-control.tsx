import { ConfigScreen } from '@/components/screens/config-screen';
import { ControlScreen } from '@/components/screens/control-screen';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useGyroscopeController } from '../../hooks/use-gyroscope-controller';

export default function CarControlScreen() {
  const controller = useGyroscopeController();

  return (
    <View style={styles.container}>
      {!controller.data.isActive ? (
        <ConfigScreen
          config={controller.config}
          onConfigChange={controller.updateConfig}
          onActivate={controller.activate}
        />
      ) : (
        <ControlScreen
          data={controller.data}
          onDeactivate={controller.deactivate}
          onCalibrateNeutral={controller.calibrateNeutral}
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
