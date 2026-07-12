import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/api/client';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { user: u } = await api.getMe();
      setUser(u);
      if (u) {
        await AsyncStorage.setItem('user', JSON.stringify(u));
      } else {
        await AsyncStorage.removeItem('user');
      }
    } catch {
      const cached = await AsyncStorage.getItem('user');
      if (cached) setUser(JSON.parse(cached));
    }
  };

  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem('user');
      if (cached) setUser(JSON.parse(cached));
      await refreshUser();
      setLoading(false);
    })();
  }, []);

  const signIn = async () => {
    try {
      await refreshUser();
    } catch {}
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
