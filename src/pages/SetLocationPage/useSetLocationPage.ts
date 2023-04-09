import { useUserContext } from "@/lib/user-context";
import { initMap } from "./locationUtils";
import { useEffect, useRef, useState } from "react";

export function useSetLocationPage() {
  const { loading } = useUserContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (mapRef.current && addressInputRef.current) {
      initMap(mapRef.current, addressInputRef.current);
    }
  }, [mapRef.current, addressInputRef.current]);

  return { loading, mapRef, addressInputRef, locationLoading, setLocationLoading };
}
