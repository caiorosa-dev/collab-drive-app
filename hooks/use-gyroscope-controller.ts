import * as ScreenOrientation from 'expo-screen-orientation';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import {
  calculateSteeringAngle,
  calculateThrottle,
  lerp,
  mapToLandscape,
  radToDeg,
} from '../utils/gyroscope';

export interface GyroscopeConfig {
  maxPitch: number;
  maxRoll: number;
  smooth: number;
  pitchThreshold: number;
  rollThreshold: number;
  updateInterval: number;
}

export interface GyroscopeData {
  throttle: number;
  steeringAngle: number;
  pitch: number;
  roll: number;
  isActive: boolean;
}

export interface GyroscopeController {
  // Main data for UI/bluetooth
  data: GyroscopeData;
  
  // Configuration
  config: GyroscopeConfig;
  updateConfig: (newConfig: Partial<GyroscopeConfig>) => void;
  
  // Control methods
  activate: () => void;
  deactivate: () => void;
  calibrateNeutral: () => void;
  
  // Debug info (optional)
  rawData: { beta: number; gamma: number };
  orientation: ScreenOrientation.Orientation | null;
}

const DEFAULT_CONFIG: GyroscopeConfig = {
  maxPitch: 35,        // Forward/backward tilt for throttle
  maxRoll: 25,         // Side-to-side tilt for steering (racing game style)
  smooth: 0.3,         // Smoothing factor (higher = smoother but less responsive)
  pitchThreshold: 4,   // Dead zone for throttle
  rollThreshold: 2,    // Dead zone for steering
  updateInterval: 50,  // Update every 50ms (20 Hz)
};

export function useGyroscopeController(): GyroscopeController {
  const [config, setConfig] = useState<GyroscopeConfig>(DEFAULT_CONFIG);
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [rawData, setRawData] = useState({ beta: 0, gamma: 0 });
  const [pitchRoll, setPitchRoll] = useState({ pitch: 0, roll: 0 });
  const [throttle, setThrottle] = useState(0);
  const [steeringAngle, setSteeringAngle] = useState(90);
  
  const subscriptionRef = useRef<any | null>(null);
  const zeroRef = useRef({ pitch: 0, roll: 0 });
  const filteredRef = useRef({ beta: 0, gamma: 0 });

  // Setup orientation tracking
  useEffect(() => {
    let listener: ScreenOrientation.Subscription | null = null;

    (async () => {
      const info = await ScreenOrientation.getOrientationAsync();
      setOrientation(info);
      listener = ScreenOrientation.addOrientationChangeListener((e) => {
        setOrientation(e.orientationInfo.orientation);
      });
    })();

    return () => {
      if (listener) ScreenOrientation.removeOrientationChangeListener(listener);
    };
  }, []);

  // Subscribe to device motion
  const subscribe = () => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    DeviceMotion.setUpdateInterval(config.updateInterval);
    
    const subscription = DeviceMotion.addListener((m: DeviceMotionMeasurement) => {
      const r = m.rotation ?? { beta: 0, gamma: 0 };
      const betaDeg = radToDeg(r.beta ?? 0);
      const gammaDeg = radToDeg(r.gamma ?? 0);

      // Apply smoothing
      filteredRef.current.beta = lerp(filteredRef.current.beta, betaDeg, config.smooth);
      filteredRef.current.gamma = lerp(filteredRef.current.gamma, gammaDeg, config.smooth);

      setRawData({ beta: betaDeg, gamma: gammaDeg });

      // Map to landscape orientation
      const currentOrientation = orientation ?? ScreenOrientation.Orientation.LANDSCAPE_LEFT;
      const { pitch, roll } = mapToLandscape(
        filteredRef.current.beta,
        filteredRef.current.gamma,
        currentOrientation
      );
      setPitchRoll({ pitch, roll });

      // Apply calibration
      const pitchAdj = pitch - zeroRef.current.pitch;
      const rollAdj = roll - zeroRef.current.roll;

      // Calculate throttle and steering
      const newThrottle = calculateThrottle(pitchAdj, config.maxPitch, config.pitchThreshold);
      const newSteeringAngle = calculateSteeringAngle(rollAdj, config.maxRoll, config.rollThreshold);

      setThrottle(Math.round(newThrottle));
      setSteeringAngle(Math.round(newSteeringAngle));
    });

    subscriptionRef.current = subscription;
    setIsActive(true);
  };

  const unsubscribe = () => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsActive(false);
    setThrottle(0);
    setSteeringAngle(90);
  };

  const calibrateNeutral = () => {
    zeroRef.current = { pitch: pitchRoll.pitch, roll: pitchRoll.roll };
  };

  const updateConfig = (newConfig: Partial<GyroscopeConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    
    // Update interval if changed and active
    if (newConfig.updateInterval && subscriptionRef.current) {
      DeviceMotion.setUpdateInterval(newConfig.updateInterval);
    }
  };

  // Auto-subscribe on mount and re-subscribe when orientation changes
  useEffect(() => {
    if (isActive) {
      subscribe();
    }
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, config]);

  return {
    data: {
      throttle,
      steeringAngle,
      pitch: pitchRoll.pitch,
      roll: pitchRoll.roll,
      isActive,
    },
    config,
    updateConfig,
    activate: subscribe,
    deactivate: unsubscribe,
    calibrateNeutral,
    rawData,
    orientation,
  };
}

