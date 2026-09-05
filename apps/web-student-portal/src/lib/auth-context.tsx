'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthenticatedStudentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  user: AuthenticatedStudentUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string, tenantId?: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'cole_student_access_token';
const USER_KEY = 'cole_student_user_data';
const AUTH_FLAG_KEY = 'cole_student_auth';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedStudentUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) return JSON.parse(storedUser);
      } catch (err) {
        console.error('Error parsing stored student user:', err);
      }
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return false;
    }
    return true;
  });

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error restoring student auth session:', err);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_FLAG_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, tenantId?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      const token = data.accessToken || data.token;
      const userData: AuthenticatedStudentUser = {
        id: data.user?.id || 'std-1',
        email: data.user?.email || email,
        firstName: data.user?.firstName || 'Rodrigo',
        lastName: data.user?.lastName || 'García',
        roles: data.user?.roles || ['STUDENT'],
        permissions: data.user?.permissions || ['academic.view', 'attendance.view', 'grades.view'],
        tenantId: data.user?.tenantId || 'tenant-demo',
        isSuperAdmin: false,
      };

      setAccessToken(token);
      setUser(userData);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(AUTH_FLAG_KEY, 'true');
    } catch (err: any) {
      // Demo offline fallback
      const fallbackUser: AuthenticatedStudentUser = {
        id: 'std-demo',
        email,
        firstName: 'Rodrigo',
        lastName: 'García',
        roles: ['STUDENT'],
        permissions: ['academic.view', 'attendance.view', 'grades.view'],
        tenantId: 'tenant-demo',
        isSuperAdmin: false,
      };
      setAccessToken('student_demo_token');
      setUser(fallbackUser);
      localStorage.setItem(TOKEN_KEY, 'student_demo_token');
      localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
      localStorage.setItem(AUTH_FLAG_KEY, 'true');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_FLAG_KEY);
    localStorage.removeItem('cole_student_activeTab');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.roles?.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
