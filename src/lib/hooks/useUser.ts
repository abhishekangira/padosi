import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "next/router";
import { User } from "@prisma/client";
import { trpc } from "../utils/trpc";

export type UserType = User | null;

export function useUser() {
  const [user, setUser] = useState<UserType>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);

  trpc.user.get.useQuery(
    { uid: auth.currentUser?.uid },
    {
      enabled: !!auth.currentUser && !user?.id,
      onSettled(data, error) {
        if (data) setUser(data);
        else console.log("Error getting user", error);
        setUserLoading(false);
      },
    }
  );

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        console.log("FIREBASE USER", firebaseUser);
        setUser({ uid: firebaseUser.uid } as User);
      } else {
        console.log("NO FIREBASE USER");
        setUser(null);
        setUserLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Route/user useEffect", {
      path: router.pathname,
      routeloading: routeLoading,
      userLoading: userLoading,
      user,
      auth: auth.currentUser,
    });
    if (userLoading) return;

    const handleRouteChangeComplete = () => {
      setRouteLoading(false);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      console.log("Route change complete", router.pathname);
    };

    if (routeLoading) router.events.on("routeChangeComplete", handleRouteChangeComplete);

    if (auth.currentUser) {
      if (!user?.id) {
        if (router.pathname !== "/set-location") router.push("/set-location");
        else setRouteLoading(false);
      } else if (["/set-location", "/"].includes(router.pathname)) router.push("/home");
      else setRouteLoading(false);
    } else {
      if (router.pathname === "/") {
        setRouteLoading(false);
        setGlobalLoading(false);
      } else {
        console.log("No user, redirecting to /");
        router.push("/");
      }
    }

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [user, router.pathname, routeLoading, userLoading, setRouteLoading, setGlobalLoading]);

  return { user, loading: userLoading || routeLoading || globalLoading, setUser, setGlobalLoading };
}
