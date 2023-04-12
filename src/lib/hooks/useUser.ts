import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, db } from "../firebase";
import { useRouter } from "next/router";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export type UserType = (User & { isUserLocationSet: boolean }) | null;

export function useUser() {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log("Auth state changed");

      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const { uid, email, displayName, photoURL } = firebaseUser;
            setDoc(userRef, { uid, email, displayName, photoURL, createdAt: serverTimestamp() });
            console.log("Doc create", {
              uid,
              email,
              displayName,
              photoURL,
              createdAt: serverTimestamp(),
            });
          } else if (
            firebaseUser?.displayName &&
            userSnap.data()?.displayName !== firebaseUser.displayName
          ) {
            updateDoc(userRef, {
              displayName: firebaseUser.displayName,
              updatedAt: serverTimestamp(),
            });
            console.log("Doc update", {
              displayName: firebaseUser.displayName,
              updatedAt: serverTimestamp(),
            });
          }
          const isUserLocationSet = !!userSnap.data()?.geoHash;
          setUser({ ...firebaseUser, isUserLocationSet });
        } catch (error) {
          console.error(error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && ["/", "/set-location"].includes(router.pathname)) {
      if (user && !user.isUserLocationSet) {
        router.push("/set-location");
      } else {
        router.push("/");
      }
    }
  }, [loading, user]);

  return { user, loading, setUser };
}
