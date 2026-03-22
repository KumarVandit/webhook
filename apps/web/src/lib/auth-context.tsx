"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface Credentials {
  apiKey: string;
  serverUrl: string;
}

interface AuthContextValue {
  connect: (credentials: Credentials) => void;
  credentials: Credentials | null;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "photon-webhook-credentials";

function loadFromStorage(): Credentials | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Credentials;
    if (parsed.serverUrl && parsed.apiKey) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials | null>(
    loadFromStorage
  );

  const connect = useCallback((creds: Credentials) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setCredentials(creds);
  }, []);

  const disconnect = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setCredentials(null);
  }, []);

  const value = useMemo(
    () => ({ credentials, connect, disconnect }),
    [credentials, connect, disconnect]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
