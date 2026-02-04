'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';

interface ToggleSwitchProps {
  initialChecked: boolean;
  onToggle: (isChecked: boolean) => Promise<boolean>; // Returns true on success, false on failure
  disabled?: boolean;
  title?: string;
}

export function ToggleSwitch({ initialChecked, onToggle, disabled = false, title }: ToggleSwitchProps) {
  const [isChecked, setIsChecked] = useState(initialChecked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    const success = await onToggle(!isChecked);
    if (success) {
      setIsChecked(!isChecked);
    }
    setIsLoading(false);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      disabled={isLoading || disabled}
      title={title}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        isChecked ? 'bg-primary' : 'bg-gray-300'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          isChecked ? 'translate-x-2' : '-translate-x-2'
        )}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
        </div>
      )}
    </button>
  );
}
