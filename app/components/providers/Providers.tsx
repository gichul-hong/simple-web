'use client';

import { SessionProvider } from 'next-auth/react';
import { ConfigProvider } from './ConfigContext';
import { SessionValidator } from '../auth/SessionValidator';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider>
      <SessionProvider refetchInterval={5 * 60}>
        <SessionValidator />
        {children}
      </SessionProvider>
    </ConfigProvider>
  );
}
