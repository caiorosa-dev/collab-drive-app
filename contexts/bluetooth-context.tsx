import React, { createContext, useContext, ReactNode } from 'react';
import { useBluetooth, UseBluetoothReturn } from '@/hooks/use-bluetooth';

const BluetoothContext = createContext<UseBluetoothReturn | undefined>(undefined);

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const bluetooth = useBluetooth();

  return (
    <BluetoothContext.Provider value={bluetooth}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetoothContext(): UseBluetoothReturn {
  const context = useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error('useBluetoothContext must be used within a BluetoothProvider');
  }
  return context;
}

