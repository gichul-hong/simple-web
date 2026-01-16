'use client';

import { SessionProvider } from 'next-auth/react';
import { ConfigProvider, AppConfig } from './ConfigContext';

// Config is now optional/ignored as we use env vars directly
export function Providers({ children, config }: { children: React.ReactNode; config?: AppConfig }) {
  return (
    <ConfigProvider>
      <SessionProvider refetchInterval={5 * 60}>
        {children}
      </SessionProvider>
    </ConfigProvider>
  );
}