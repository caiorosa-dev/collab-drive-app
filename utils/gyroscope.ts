import * as ScreenOrientation from 'expo-screen-orientation';

/**
 * Converts radians to degrees
 */
export function radToDeg(v: number): number {
  return v * (180 / Math.PI);
}

/**
 * Clamps a value between min and max
 */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Maps beta/gamma angles to pitch/roll based on screen orientation
 * 
 * Racing game convention:
 * - pitch > 0 = tilt forward (accelerate)
 * - roll > 0 = tilt right (steer right) - like turning a steering wheel
 * 
 * Fixed for natural racing game controls (not inverted)
 */
export function mapToLandscape(
  betaDeg: number,
  gammaDeg: number,
  orientation: ScreenOrientation.Orientation
): { pitch: number; roll: number } {
  if (orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT) {
    // Landscape left: home button on left
    // Tilt phone right (like steering wheel) = positive roll
    return { pitch: -gammaDeg, roll: -betaDeg };
  }
  if (orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
    // Landscape right: home button on right
    // Tilt phone right (like steering wheel) = positive roll
    return { pitch: gammaDeg, roll: betaDeg };
  }
  // Fallback for portrait mode
  return { pitch: betaDeg, roll: gammaDeg };
}

/**
 * Calculates throttle percentage from pitch adjustment
 * 
 * Uses exponential curve for smoother acceleration control
 */
export function calculateThrottle(
  pitchAdj: number,
  maxPitch: number,
  threshold: number = 0
): number {
  if (Math.abs(pitchAdj) < threshold) return 0;
  
  // Normalize to -1 to 1
  const normalized = clamp(pitchAdj / maxPitch, -1, 1);
  
  // Apply exponential curve for smoother acceleration
  const curved = Math.sign(normalized) * Math.pow(Math.abs(normalized), 1.3);
  
  return curved * 100;
}

/**
 * Calculates steering angle from roll adjustment
 * 
 * Uses exponential curve for more precise control near center
 * (like in racing games)
 */
export function calculateSteeringAngle(
  rollAdj: number,
  maxRoll: number,
  threshold: number = 0
): number {
  if (Math.abs(rollAdj) < threshold) return 90;
  
  // Normalize to -1 to 1
  const normalized = clamp(rollAdj / maxRoll, -1, 1);
  
  // Apply exponential curve for more natural feel
  // This gives finer control near center, more aggressive at extremes
  const curved = Math.sign(normalized) * Math.pow(Math.abs(normalized), 1.5);
  
  // Map to 0-180 degrees (90 = center)
  return clamp(90 + curved * 90, 0, 180);
}

/**
 * Gets color based on throttle value
 */
export function getThrottleColor(throttle: number): string {
  const absThrottle = Math.abs(throttle);
  
  if (absThrottle < 10) return '#666'; // Neutral - gray
  if (absThrottle < 30) return '#4CAF50'; // Low - green
  if (absThrottle < 60) return '#FFC107'; // Medium - yellow
  if (absThrottle < 80) return '#FF9800'; // High - orange
  return '#F44336'; // Max - red
}

/**
 * Calculates arrow rotation angle based on throttle and steering
 */
export function calculateArrowRotation(throttle: number, steeringAngle: number): number {
  // Convert steering angle (0-180) to rotation (-90 to 90)
  const baseRotation = (steeringAngle - 90);
  
  // If throttle is negative (reverse), flip the arrow
  if (throttle < 0) {
    return baseRotation + 180;
  }
  
  return baseRotation;
}

