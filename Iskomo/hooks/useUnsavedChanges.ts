'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges(hasChanges: boolean, message = 'You have unsaved changes. Leave anyway?') {
  // Block browser back/refresh
  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges, message]);
}

export function useConfirmLeave(hasChanges: boolean, message = 'You have unsaved changes. Leave anyway?') {
  const confirmLeave = useCallback(() => {
    if (!hasChanges) return true;
    return window.confirm(message);
  }, [hasChanges, message]);

  return confirmLeave;
}
