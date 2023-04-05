import React, { useContext } from "react";
import { User } from "firebase/auth";
import { auth } from "./firebase";
import { useSyncExternalStore } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

type AuthContextType = { user: User | null; loading: boolean };

const AuthContext = React.createContext<AuthContextType>({ user: null, loading: true });
export const useAuth = () => useContext(AuthContext);
let lastState: AuthContextType = { user: null, loading: true };

function getSnapshot() {
  return lastState;
}

function getServerSnapshot() {
  return lastState;
}

function subscribe(callback: () => void) {
  const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
    const currentState = { user: firebaseUser, loading: false };
    if (currentState.user !== lastState.user || currentState.loading !== lastState.loading) {
      lastState = currentState;
      callback();
    }
  });

  return () => {
    unsubscribe();
  };
}
