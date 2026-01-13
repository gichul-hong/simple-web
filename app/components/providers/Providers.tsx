'use client';

import { SessionProvider } from 'next-auth/react';
import { ConfigProvider, AppConfig } from './ConfigContext';

export function Providers({ children, config }: { children: React.ReactNode; config: AppConfig }) {
  return (
    <ConfigProvider config={config}>
      <SessionProvider refetchInterval={5 * 60}>
        {children}
      </SessionProvider>
    </ConfigProvider>
  );
}
