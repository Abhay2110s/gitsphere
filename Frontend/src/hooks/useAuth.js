import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('gitsphere_user') : null;
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.getMe();
      if (data) {
        setUser(data);
        try {
          localStorage.setItem('gitsphere_user', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    authApi.getMe()
      .then((data) => {
        if (!ignore && data) {
          setUser(data);
          try {
            localStorage.setItem('gitsphere_user', JSON.stringify(data));
          } catch {
            // ignore
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setLoading(false);
        }
      });

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('gitsphere:unauthorized', handleUnauthorized);
    return () => {
      ignore = true;
      window.removeEventListener('gitsphere:unauthorized', handleUnauthorized);
    };
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    logout,
  };
}
