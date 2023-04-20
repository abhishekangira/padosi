import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "next/router";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export type UserType = (User & { isUserLocationSet: boolean; username: string }) | null;

let isUserSet = false;

export function useUser() {
  const [user, setUser] = useState<UserType>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(true);
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
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Route/user useEffect", router.pathname, routeLoading);
    if (userLoading) return;

    const handleRouteChangeComplete = () => {
      setRouteLoading(false);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      console.log("Route change complete", router.pathname);
    };

    if (routeLoading) router.events.on("routeChangeComplete", handleRouteChangeComplete);

    if (user?.uid) {
      if (!user.isUserLocationSet) {
        if (router.pathname !== "/set-location") router.push("/set-location");
        else setRouteLoading(false);
      } else if (["/set-location", "/"].includes(router.pathname)) router.push("/home");
      else setRouteLoading(false);
    } else {
      if (router.pathname === "/") setRouteLoading(false);
      else router.push("/");
    }

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [user, router.pathname, routeLoading, userLoading, setRouteLoading]);

  return { user, loading: userLoading || routeLoading, setUser };
}
