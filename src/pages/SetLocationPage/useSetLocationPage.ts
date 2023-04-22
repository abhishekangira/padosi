import { useUserContext } from "@/lib/contexts/user-context";
import { getMarkerPosition, initMap } from "./locationUtils";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { UserType } from "@/lib/hooks/useUser";

export function useSetLocationPage() {
  const { setUser } = useUserContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [usernameState, setUsernameState] = useState<"loading" | "unavailable" | "available" | null>(null);

  const handleSubmit = () => {
    const pos = getMarkerPosition();
    if (auth.currentUser && pos.lat && pos.lng) {
      updateDoc(doc(db, "users", auth.currentUser.uid), {
        geoHash: geohashForLocation([pos.lat, pos.lng]),
        location: {
          lat: pos.lat,
          lng: pos.lng,
        },
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          setUser(
            (prev) =>
            ({
              ...prev,
              isUserLocationSet: true,
              geoHash: geohashForLocation([pos.lat!, pos.lng!]),
              location: {
                lat: pos.lat,
                lng: pos.lng,
              },
            } as UserType)
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  useEffect(() => {
    if (mapRef.current && addressInputRef.current) {
      initMap(mapRef.current, addressInputRef.current);
    }
  }, [mapRef.current, addressInputRef.current]);

  return {
    mapRef,
    addressInputRef,
    locationLoading,
    setLocationLoading,
    handleSubmit,
    usernameState,
    setUsernameState
  };
}
