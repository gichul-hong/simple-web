'use client';

import { SessionProvider } from 'next-auth/react';
import { ConfigProvider } from './ConfigContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider>
      <SessionProvider refetchInterval={5 * 60}>
        {children}
      </SessionProvider>
    </ConfigProvider>
  );
}
