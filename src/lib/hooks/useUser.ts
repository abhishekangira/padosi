import React, { useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, db } from "../firebase";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";

export type UserType = (User & { isUserLocationSet: boolean }) | null;

export function useUser() {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  console.count("useUser");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const isUserLocationSet = !!userSnap.data()?.geoHash;
        setUser({ ...firebaseUser, isUserLocationSet });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (!user.isUserLocationSet) {
          router.push("/set-location");
        }
      } else {
        router.push("/");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  return { user, loading, setUser };
}
