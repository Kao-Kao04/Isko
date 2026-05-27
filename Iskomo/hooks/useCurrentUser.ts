import { useState, useEffect } from 'react';
import { getMe, type User } from '@/lib/auth';

let cachedUser: User | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000;

export function clearUserCache() {
  cachedUser = null;
  cacheTimestamp = 0;
}

export function useCurrentUser() {
  const isFresh = cachedUser !== null && Date.now() - cacheTimestamp < CACHE_TTL;
  const [user, setUser]       = useState<User | null>(isFresh ? cachedUser : null);
  const [loading, setLoading] = useState(!isFresh);

  useEffect(() => {
    if (cachedUser !== null && Date.now() - cacheTimestamp < CACHE_TTL) return;
    getMe()
      .then(u => {
        cachedUser = u;
        cacheTimestamp = Date.now();
        setUser(u);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token' && e.newValue === null) {
        clearUserCache();
        setUser(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { user, loading };
}
