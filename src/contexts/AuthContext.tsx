'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isPaid: boolean;
  subscriptionStatus?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeUser = (rawUser: any): User => ({
    id: rawUser.id,
    email: rawUser.email,
    name: rawUser.name ?? undefined,
    image: rawUser.image ?? undefined,
    isPaid: rawUser.isPaid ?? false,
    subscriptionStatus: rawUser.subscriptionStatus ?? (rawUser.isPaid ? 'active' : 'none'),
  });

  useEffect(() => {
    const loadUserFromStorage = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as User;
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('user');
        }
      }
    };

    // Fetch user from server to sync with server-side auth
    const fetchUser = async () => {
      try {
        if (typeof window !== 'undefined' && !navigator.onLine) {
          const savedUser = window.localStorage.getItem('user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              const normalized = normalizeUser(parsedUser);
              setUser(normalized);
            } catch (e) {
              window.localStorage.removeItem('user');
              setUser(null);
            }
          }
          return;
        }

        setIsLoading(true);

        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Include cookies
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            const normalized = normalizeUser(data.user);
            setUser(normalized);
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('user', JSON.stringify(normalized));
            }
          } else {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('user');
            }
            setUser(null);
          }
        } else {
          // Server says not authenticated - clear localStorage and user state
          // This handles expired tokens, invalid cookies, etc.
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('user');
          }
          setUser(null);
        }
      } catch (error) {
        console.warn('Unable to reach /api/auth/me:', error);
        // Only use localStorage fallback if we're truly offline
        // If online but request failed, server may have rejected us - clear localStorage
        if (typeof window !== 'undefined' && navigator.onLine === false) {
          const savedUser = window.localStorage.getItem('user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              const normalized = normalizeUser(parsedUser);
              setUser(normalized);
            } catch (e) {
              window.localStorage.removeItem('user');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          // Online but request failed - likely server rejection, clear localStorage
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('user');
          }
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Hydrate from storage immediately on mount
    loadUserFromStorage();

    fetchUser();

    // Set up interval to check auth status periodically (every 5 minutes)
    const authCheckInterval = setInterval(() => {
      fetchUser();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(authCheckInterval);
  }, []);

  const login = async (userData: User) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
    
    // Verify with server to ensure token is valid
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // Update with server data (may have more complete info)
          const refreshed = normalizeUser(data.user);
          setUser(refreshed);
          localStorage.setItem('user', JSON.stringify(refreshed));
        } else {
          // Server didn't return user - token may be invalid, clear localStorage
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        // Server rejected - token invalid, clear localStorage
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error verifying login:', error);
      // On error, if online, assume server rejection and clear localStorage
      if (typeof window !== 'undefined' && navigator.onLine !== false) {
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
    
    // Redirect to landing page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

