import React, { useState, useEffect, useContext } from "react";
import { User } from "firebase/auth";
import { auth } from "./firebase";

type AuthContextType = { user: User | null; loading: boolean };

const AuthContext = React.createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (firebaseUser) => {
        console.log("🚀 ~ file: AuthContext.tsx:16 ~ unsubscribe ~ firebaseUser:", firebaseUser);
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
