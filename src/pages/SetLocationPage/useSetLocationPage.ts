import { useUserContext } from "@/lib/contexts/user-context";
import { getMarkerPosition, initMap } from "./locationUtils";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase/firebase";
import { trpc } from "@/lib/utils/trpc";
import { useRouter } from "next/router";

export function useSetLocationPage() {
  const { setUser } = useUserContext();
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [username, setUsername] = useState<{
    value: string;
    state: "loading" | "unavailable" | "available" | null;
  }>({ value: "", state: null });
  const { mutate: createUser } = trpc.user.create.useMutation({
    onSuccess: (data) => {
      setUser(data);
      router.push("/home");
    },
    onError(error, variables, context) {
      setSubmitLoading(false);
      console.log("Error creating user", error, variables, context);
    },
  });
  const mapInitiatedRef = useRef(false);
  const { refetch } = trpc.user.get.useQuery(
    { username: username.value },
    { enabled: false, retry: false }
  );

  const handleSubmit = () => {
    setSubmitLoading(true);
    const pos = getMarkerPosition();
    if (auth.currentUser && pos.lat && pos.lng && username.value) {
      createUser({
        username: username.value.toLowerCase(),
        uid: auth.currentUser.uid,
        email: auth.currentUser.email!,
        name: auth.currentUser.displayName!,
        longitude: pos.lng,
        latitude: pos.lat,
        photo: auth.currentUser.photoURL,
      });
    }
  };

  useEffect(() => {
    if (mapRef.current && addressInputRef.current && !mapInitiatedRef.current) {
      initMap(mapRef.current, addressInputRef.current);
      mapInitiatedRef.current = true;
    }
  }, [mapRef.current, addressInputRef.current, mapInitiatedRef.current]);

  return {
    mapRef,
    addressInputRef,
    locationLoading,
    setLocationLoading,
    handleSubmit,
    username,
    setUsername,
    checkUsername: refetch,
    submitLoading,
  };
}
