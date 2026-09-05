'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getCookie, setCookie } from '../lib/cookies';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../lib/api';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  roles: string[];
  isSuperAdmin: boolean;
}

export interface AuthSessionContextType {
  isAuthenticated: boolean;
  user: UserSession | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: (reason?: string) => void;
  // Session timeout configuration
  timeoutMinutes: number;
  setTimeoutMinutes: (mins: number) => void;
  warningSeconds: number;
  setWarningSeconds: (secs: number) => void;
  updateSessionConfig: (mins: number, warningSecs: number) => void;
  remainingSeconds: number;
  formattedRemaining: string;
  isWarningOpen: boolean;
  setIsWarningOpen: (open: boolean) => void;
  extendSession: () => void;
  sessionStartTime: string | null;
  logoutReason: string | null;
  clearLogoutReason: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextType | undefined>(undefined);

const COOKIE_TIMEOUT_KEY = 'cole_session_timeout_mins';
const COOKIE_WARNING_KEY = 'cole_session_warning_secs';

interface AuthSessionProviderProps {
  children: ReactNode;
  onSessionEnd?: () => void;
}

export function AuthSessionProvider({ children, onSessionEnd }: AuthSessionProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [logoutReason, setLogoutReason] = useState<string | null>(null);

  // Default: 30 minutes timeout, 60 seconds warning
  const [timeoutMinutes, setTimeoutMinutesState] = useState<number>(30);
  const [warningSeconds, setWarningSecondsState] = useState<number>(60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30 * 60);
  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from cookies / localStorage on mount
  useEffect(() => {
    try {
      const token = getCookie('cole_super_admin_token') || localStorage.getItem('cole_super_admin_token');
      const currentUser = getCurrentUser();
      const startTime = getCookie('cole_super_admin_session_start') || localStorage.getItem('cole_super_admin_session_start');

      const savedTimeout = getCookie(COOKIE_TIMEOUT_KEY) || localStorage.getItem(COOKIE_TIMEOUT_KEY);
      if (savedTimeout) {
        const parsed = parseInt(savedTimeout, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setTimeoutMinutesState(parsed);
          setRemainingSeconds(parsed * 60);
        }
      }

      const savedWarning = getCookie(COOKIE_WARNING_KEY) || localStorage.getItem(COOKIE_WARNING_KEY);
      if (savedWarning) {
        const parsed = parseInt(savedWarning, 10);
        if (!isNaN(parsed) && parsed >= 0) setWarningSecondsState(parsed);
      }

      if (token && currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
        setSessionStartTime(startTime || new Date().toISOString());
        lastActivityRef.current = Date.now();
      }
    } catch {
      // Ignored
    }
  }, []);

  const setTimeoutMinutes = (mins: number) => {
    if (mins <= 0) return;
    setTimeoutMinutesState(mins);
    setRemainingSeconds(mins * 60);
    setCookie(COOKIE_TIMEOUT_KEY, mins.toString(), { days: 30 });
    try {
      localStorage.setItem(COOKIE_TIMEOUT_KEY, mins.toString());
    } catch { /* ignore */ }
  };

  const setWarningSeconds = (secs: number) => {
    setWarningSecondsState(secs);
    setCookie(COOKIE_WARNING_KEY, secs.toString(), { days: 30 });
    try {
      localStorage.setItem(COOKIE_WARNING_KEY, secs.toString());
    } catch { /* ignore */ }
  };

  const updateSessionConfig = (mins: number, warningSecs: number) => {
    setTimeoutMinutes(mins);
    setWarningSeconds(warningSecs);
  };

  const logout = useCallback((reason?: string) => {
    apiLogout();
    setIsAuthenticated(false);
    setUser(null);
    setSessionStartTime(null);
    setIsWarningOpen(false);
    if (reason) {
      setLogoutReason(reason);
    }
    if (onSessionEnd) {
      onSessionEnd();
    }
  }, [onSessionEnd]);

  const login = async (email: string, pass: string) => {
    const res = await apiLogin(email, pass);
    setIsAuthenticated(true);
    setUser(res.user);
    const now = new Date().toISOString();
    setSessionStartTime(now);
    lastActivityRef.current = Date.now();
    setRemainingSeconds(timeoutMinutes * 60);
    setIsWarningOpen(false);
    setLogoutReason(null);
  };

  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingSeconds(timeoutMinutes * 60);
    setIsWarningOpen(false);
  }, [timeoutMinutes]);

  // Activity listeners (debounced / throttled)
  useEffect(() => {
    if (!isAuthenticated) return;

    let throttleTimer: NodeJS.Timeout | null = null;

    const handleUserActivity = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        // If warning is not active, keep session fresh
        if (!isWarningOpen) {
          lastActivityRef.current = Date.now();
        }
        throttleTimer = null;
      }, 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'focus'];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isAuthenticated, isWarningOpen]);

  // Periodic Countdown & Inactivity check (runs every second)
  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const totalTimeoutSecs = timeoutMinutes * 60;
      const remaining = Math.max(0, totalTimeoutSecs - elapsedSeconds);

      setRemainingSeconds(remaining);

      // Trigger warning dialog
      if (warningSeconds > 0 && remaining <= warningSeconds && remaining > 0) {
        setIsWarningOpen(true);
      } else if (remaining > warningSeconds) {
        setIsWarningOpen(false);
      }

      // Auto-logout when timer reaches 0
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        logout('Tu sesión se ha cerrado automáticamente por inactividad.');
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, timeoutMinutes, warningSeconds, logout]);

  const clearLogoutReason = () => setLogoutReason(null);

  // Formatted remaining string for live UI header
  const minsRemaining = Math.floor(remainingSeconds / 60);
  const secsRemaining = remainingSeconds % 60;
  const formattedRemaining = `${minsRemaining}:${String(secsRemaining).padStart(2, '0')}`;

  return (
    <AuthSessionContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        timeoutMinutes,
        setTimeoutMinutes,
        warningSeconds,
        setWarningSeconds,
        updateSessionConfig,
        remainingSeconds,
        formattedRemaining,
        isWarningOpen,
        setIsWarningOpen,
        extendSession,
        sessionStartTime,
        logoutReason,
        clearLogoutReason,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }
  return context;
}
