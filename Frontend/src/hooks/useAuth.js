import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
    fetchUser();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('gitsphere:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('gitsphere:unauthorized', handleUnauthorized);
    };
  }, [fetchUser]);

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
