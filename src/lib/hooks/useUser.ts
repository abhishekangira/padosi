import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "next/router";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export type UserType = (User & { isUserLocationSet: boolean; username: string }) | null;

let isUserSet = false;

export function useUser() {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user?.uid && user?.username && !isUserSet) {
      console.log("User useeffect", user);
      const userRef = doc(db, "users", user?.uid);
      getDoc(userRef).then((userSnap) => {
        console.log("in getDoc", user);
        if (userSnap.exists()) {
          console.log("User snap exists", user);

          updateDoc(userRef, {
            username: user.username,
            updatedAt: serverTimestamp(),
          });
          isUserSet = true;
        }
      });
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log("Auth state changed");

      if (firebaseUser) {
        const { uid, email, photoURL } = firebaseUser;
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            setDoc(userRef, {
              uid,
              email,
              displayName: firebaseUser.displayName,
              photoURL,
              createdAt: serverTimestamp(),
            });
            console.log("Doc create", {
              uid,
              email,
              displayName: firebaseUser.displayName,
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
          setUser(
            (prev) =>
              ({
                ...prev,
                uid,
                email,
                displayName: firebaseUser.displayName,
                photoURL,
                isUserLocationSet,
              } as UserType)
          );
        } catch (error) {
          console.error(error);
        }
      } else {
        setUser(null);
        isUserSet = false;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && ["/", "/set-location"].includes(router.pathname)) {
      if (user?.uid && !user.isUserLocationSet) router.push("/set-location");
      else router.push("/");
    }
  }, [loading, user]);

  return { user, loading, setUser };
}
