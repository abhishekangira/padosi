import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "next/router";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { User } from "@prisma/client";
import { trpc } from "../utils/trpc";

export type UserType = User | null;

export function useUser() {
  const [user, setUser] = useState<UserType>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);

  trpc.user.getUser.useQuery(
    { uid: user!?.uid },
    {
      enabled: !!user?.uid && !user.id,
      onSuccess(data) {
        console.log("useUser getUser onSuccess", data);

        setUser(data);
        setUserLoading(false);
      },
    }
  );

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        if (!user)
          setUser({
            uid: firebaseUser.uid,
          } as UserType);
      } else {
        console.log("NO FIREBASE USER");
        setUser(null);
        setUserLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   console.log("Route/user useEffect", router.pathname, routeLoading);
  //   if (userLoading) return;

  //   const handleRouteChangeComplete = () => {
  //     setRouteLoading(false);
  //     router.events.off("routeChangeComplete", handleRouteChangeComplete);
  //     console.log("Route change complete", router.pathname);
  //   };

  //   if (routeLoading) router.events.on("routeChangeComplete", handleRouteChangeComplete);

  //   if (auth.currentUser) {
  //     if (!user?.id) {
  //       if (router.pathname !== "/set-location") router.push("/set-location");
  //       else setRouteLoading(false);
  //     } else if (["/set-location", "/"].includes(router.pathname)) router.push("/home");
  //     else setRouteLoading(false);
  //   } else {
  //     if (router.pathname === "/") setRouteLoading(false);
  //     else router.push("/");
  //   }

  //   return () => {
  //     router.events.off("routeChangeComplete", handleRouteChangeComplete);
  //   };
  // }, [user, router.pathname, routeLoading, userLoading, setRouteLoading]);

  return { user, loading: userLoading || routeLoading, setUser, setUserLoading };
}
