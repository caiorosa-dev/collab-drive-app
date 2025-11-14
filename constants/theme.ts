/**
 * Collab Drive App Theme
 * Modern light interface with zinc palette and blue accents
 */

import { Platform } from 'react-native';

// Zinc Palette (Light mode focus)
export const zinc = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
};

// Blue Accents
export const blue = {
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
};

// Status Colors
export const status = {
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

export const Colors = {
  light: {
    // Backgrounds
    background: zinc[50],
    backgroundSecondary: '#ffffff',
    backgroundCard: '#ffffff',
    
    // Text
    text: zinc[900],
    textSecondary: zinc[600],
    textMuted: zinc[500],
    
    // Primary (Blue)
    primary: blue[500],
    primaryHover: blue[600],
    primaryText: '#ffffff',
    
    // Borders & Dividers
    border: zinc[200],
    borderLight: zinc[100],
    
    // Icons
    icon: zinc[600],
    iconMuted: zinc[400],
    
    // Status
    success: status.success,
    warning: status.warning,
    danger: status.danger,
    info: status.info,
    
    // Tabs
    tint: blue[500],
    tabIconDefault: zinc[400],
    tabIconSelected: blue[500],
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Keep for future dark mode support
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
