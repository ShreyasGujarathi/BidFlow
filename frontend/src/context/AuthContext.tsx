'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User } from "../lib/types";
import {
  AuthPayload,
  AuthResponse,
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "../lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (payload: AuthPayload) => Promise<AuthResponse>;
  register: (payload: AuthPayload) => Promise<AuthResponse>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "auction-hub-token";
const USER_STORAGE_KEY = "auction-hub-user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedToken = localStorage.getItem(STORAGE_KEY);
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser) as User);
          } catch {
            // ignore parse errors
          }
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    } finally {
      setInitialized(true);
    }
  }, []);

  const persistToken = useCallback((value: string | null) => {
    if (typeof window === "undefined") return;
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persistUser = useCallback((value: User | null) => {
    if (typeof window === "undefined") return;
    if (value) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      if (initialized) {
        setUser(null);
        setLoading(false);
        persistToken(null);
        persistUser(null);
      }
      return;
    }

    let cancelled = false;

    const loadUser = async () => {
      try {
        setLoading(true);
        const profile = await fetchCurrentUser(token);
        if (!cancelled) {
          setUser(profile);
          persistUser(profile);
        }
      } catch (error) {
        console.error("Failed to load current user", error);
        if (!cancelled) {
          setToken(null);
          setUser(null);
          persistToken(null);
          persistUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [token, persistToken, persistUser, initialized]);

  const handleAuthSuccess = useCallback(
    (response: AuthResponse) => {
      setToken(response.token);
      setUser(response.user);
      persistToken(response.token);
      persistUser(response.user);
      return response;
    },
    [persistToken, persistUser]
  );

  const login = useCallback(
    async (payload: AuthPayload) => {
      const response = await loginUser(payload);
      return handleAuthSuccess(response);
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (payload: AuthPayload) => {
      const response = await registerUser(payload);
      return handleAuthSuccess(response);
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistToken(null);
    persistUser(null);
  }, [persistToken, persistUser]);

  const refresh = useCallback(async () => {
    if (!token) return;
    const profile = await fetchCurrentUser(token);
    setUser(profile);
    persistUser(profile);
  }, [token, persistUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      initialized,
      login,
      register,
      logout,
      refresh,
    }),
    [user, token, loading, initialized, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

