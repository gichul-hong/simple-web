'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export function SessionValidator() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.error === 'RefreshAccessTokenError') {
      signOut({
        callbackUrl: '/', // Redirect to home page after sign out
        redirect: true,
      });
    }
  }, [session, status]);

  // This component does not render anything
  return null;
}
