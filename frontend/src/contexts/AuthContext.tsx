import { ReactNode, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/config/constants';
import { AuthContext } from './auth-context';
import { applyTheme, getStoredTheme } from '@/lib/theme';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    const token = localStorage.getItem('token');
    return token ? null : false;
  });

  useEffect(() => {
    applyTheme(getStoredTheme());

    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        setIsAuthenticated(data.success);

        if (!data.success) {
          localStorage.removeItem('token');
          return;
        }

        if (data.data?.theme === 'light' || data.data?.theme === 'dark') {
          applyTheme(data.data.theme);
        }
      } catch {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    };

    void checkAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
