"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'clinician' | 'doctor' | 'patient' | 'admin';
  specialty?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  register: (full_name: string, email: string, password: string, role: string, specialty?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Restore session from localStorage on initial render
    const storedToken = localStorage.getItem('healthguard_token');
    const storedUserStr = localStorage.getItem('healthguard_user');

    if (storedToken && storedUserStr) {
      try {
        const parsedUser: User = JSON.parse(storedUserStr);
        // Check if there is a registered full name stored for this user email
        const storedRegStr = localStorage.getItem('myhealth_registered_users');
        if (storedRegStr && parsedUser.email) {
          try {
            const regMap = JSON.parse(storedRegStr);
            const savedName = regMap[parsedUser.email.trim().toLowerCase()]?.full_name;
            if (savedName && savedName !== parsedUser.full_name) {
              parsedUser.full_name = savedName;
              localStorage.setItem('healthguard_user', JSON.stringify(parsedUser));
            }
          } catch (e) {}
        }
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored session:', e);
        localStorage.removeItem('healthguard_token');
        localStorage.removeItem('healthguard_user');
      }
    } else {
      // Default initial mock clinician session for instant demo testing
      const defaultUser: User = {
        id: "u-101",
        email: "dr.eleanor@healthguard.ai",
        full_name: "Dr. Eleanor Vance",
        role: "clinician",
        specialty: "Chief Nephrologist & Chronic Care Lead",
        avatar: "EV"
      };
      const defaultToken = "demo-jwt-token-active-session";
      setUser(defaultUser);
      setToken(defaultToken);
      localStorage.setItem('healthguard_token', defaultToken);
      localStorage.setItem('healthguard_user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string = 'clinician'): Promise<boolean> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      
      // Check registered users map
      const storedRegStr = localStorage.getItem('myhealth_registered_users');
      let savedFullName = '';
      if (storedRegStr) {
        try {
          const regMap = JSON.parse(storedRegStr);
          savedFullName = regMap[cleanEmail]?.full_name || '';
        } catch (e) {}
      }

      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Login failed');
      }

      const data = await res.json();
      const userObj = data.user;
      if (savedFullName && userObj) {
        userObj.full_name = savedFullName;
      }

      setToken(data.access_token);
      setUser(userObj);

      localStorage.setItem('healthguard_token', data.access_token);
      localStorage.setItem('healthguard_user', JSON.stringify(userObj));

      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback for client-side testing
      if (email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        let hash = 0;
        for (let i = 0; i < cleanEmail.length; i++) {
          hash = ((hash << 5) - hash) + cleanEmail.charCodeAt(i);
          hash |= 0;
        }
        const detId = "u-user-" + Math.abs(hash).toString(36);

        // Check local registered map
        const storedRegStr = localStorage.getItem('myhealth_registered_users');
        let savedFullName = '';
        if (storedRegStr) {
          try {
            const regMap = JSON.parse(storedRegStr);
            savedFullName = regMap[cleanEmail]?.full_name || '';
          } catch (e) {}
        }

        const prettyEmailName = cleanEmail.split('@')[0].replace(/[0-9]/g, ' ').replace(/[._]/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase());
        const resolvedName = savedFullName || (email.includes("eleanor") ? "Dr. Eleanor Vance" : (email.includes("marcus") ? "Dr. Marcus Thorne" : (prettyEmailName || "User")));

        const getInitials = (nameStr: string) => {
          return nameStr
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p[0])
            .join('')
            .toUpperCase() || "US";
        };

        const fallbackUser: User = {
          id: detId,
          email: email,
          full_name: resolvedName,
          role: (role as any) || "patient",
          specialty: "Clinical Specialist",
          avatar: getInitials(resolvedName)
        };
        const fallbackToken = "demo-jwt-token-" + detId;
        setToken(fallbackToken);
        setUser(fallbackUser);
        localStorage.setItem('healthguard_token', fallbackToken);
        localStorage.setItem('healthguard_user', JSON.stringify(fallbackUser));
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (full_name: string, email: string, password: string, role: string, specialty?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      // Save user full name to local registered user dictionary
      const storedRegStr = localStorage.getItem('myhealth_registered_users') || '{}';
      let regMap = {};
      try { regMap = JSON.parse(storedRegStr); } catch (e) {}
      (regMap as any)[cleanEmail] = { full_name, email: cleanEmail, role, specialty };
      localStorage.setItem('myhealth_registered_users', JSON.stringify(regMap));

      const res = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password, role, specialty }),
      });

      let userObj: User;
      let tokenVal: string;

      const getInitials = (nameStr: string) => {
        return nameStr
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(p => p[0])
          .join('')
          .toUpperCase() || "US";
      };

      if (res.ok) {
        const data = await res.json();
        tokenVal = data.access_token;
        userObj = data.user;
        userObj.full_name = full_name;
      } else {
        tokenVal = "demo-jwt-token-" + cleanEmail;
        userObj = {
          id: "u-" + Date.now(),
          email: cleanEmail,
          full_name: full_name,
          role: role as any,
          specialty: specialty || "Patient",
          avatar: getInitials(full_name)
        };
      }

      setToken(tokenVal);
      setUser(userObj);

      localStorage.setItem('healthguard_token', tokenVal);
      localStorage.setItem('healthguard_user', JSON.stringify(userObj));

      return true;
    } catch (err: any) {
      console.error('Registration error:', err);
      // Fallback register
      const cleanEmail = email.trim().toLowerCase();
      const getInitials = (nameStr: string) => {
        return nameStr
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(p => p[0])
          .join('')
          .toUpperCase() || "US";
      };
      const fallbackUser: User = {
        id: "u-" + Date.now(),
        email: cleanEmail,
        full_name: full_name,
        role: role as any,
        specialty: specialty || "Patient",
        avatar: getInitials(full_name)
      };
      const fallbackToken = "demo-jwt-token-" + cleanEmail;
      setToken(fallbackToken);
      setUser(fallbackUser);
      localStorage.setItem('healthguard_token', fallbackToken);
      localStorage.setItem('healthguard_user', JSON.stringify(fallbackUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('healthguard_token');
    localStorage.removeItem('healthguard_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
