import { PermissionsAndroid, Platform } from 'react-native';

export async function requestAccessFineLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission Required',
      message:
        'Bluetooth Classic requires location permission for device discovery. ' +
        'This is required by Android to scan for nearby Bluetooth devices.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const apiLevel = Platform.Version;

    // Android 12+ requires new Bluetooth permissions
    if (apiLevel >= 31) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);

      return (
        results['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        results['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      // For Android < 12, location permission is sufficient
      return await requestAccessFineLocationPermission();
    }
  } catch (error) {
    console.error('Error requesting Bluetooth permissions:', error);
    return false;
  }
}