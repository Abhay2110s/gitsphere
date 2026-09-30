import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch (err) {
      setUser(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    authApi.getMe()
      .then((data) => {
        if (!ignore) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setUser(null);
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
