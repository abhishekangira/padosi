import { BiCheck, BiCurrentLocation, BiLoader, BiX } from "react-icons/bi";
import { getCurrentPosition } from "./locationUtils";
import { useSetLocationPage } from "./useSetLocationPage";
import Script from "next/script";
import { debounce } from "@/lib/utils/general";
import { Dispatch, SetStateAction } from "react";
import { User } from "@prisma/client";

const gmapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function SetLocationPage() {
  const {
    mapRef,
    addressInputRef,
    locationLoading,
    setLocationLoading,
    handleSubmit,
    username,
    setUsername,
    checkUsername,
    submitLoading,
  } = useSetLocationPage();
  return (
    <>
      <Script id="google-maps-script">
        {`(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src="https://maps."+c+"apis.com/maps/api/js?"+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({key: '` +
          gmapsApiKey +
          `',});`}
      </Script>
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 p-4">
        <>
          <h1 className="self-start text-lg">1. Select a username</h1>
          <div className="flex self-start">
            <input
              type="text"
              id="username"
              value={username.value}
              onChange={(e) => {
                setUsername({ value: e.target.value, state: "loading" });
                debouncedCheckUsernameExists(e.target.value, setUsername, checkUsername);
              }}
              placeholder="simmiddlj"
              className="input self-start"
            />
            <div className="text-xl text-primary grid place-items-center px-2">
              {username.state === "loading" && <BiLoader className="animate-spin" />}
              {username.state === "available" && <BiCheck className="text-success" />}
              {username.state === "unavailable" && <BiX className="text-error" />}
            </div>
          </div>
        </>

        <h1 className="self-start text-lg">
          2. Auto detect, type your address or click on the map to set your location
        </h1>
        <div className="input-group">
          <input type="text" ref={addressInputRef} className="input w-full" autoComplete="off" />
          <div className="tooltip tooltip-left" data-tip="Auto Detect Location">
            <button
              className={`btn-square btn rounded-l-none text-xl text-primary ${
                locationLoading ? "loading" : ""
              }`}
              onClick={async () => {
                if (navigator.geolocation && addressInputRef.current) {
                  await getCurrentPosition(addressInputRef.current, setLocationLoading, {
                    enableHighAccuracy: true,
                  });
                } else {
                  console.warn("Geolocation is not supported by your browser");
                }
              }}
            >
              {!locationLoading && <BiCurrentLocation />}
            </button>
          </div>
        </div>
        <button
          className={`btn-primary btn-sm btn ${submitLoading ? "loading" : ""}`}
          onClick={handleSubmit}
          disabled={username.state !== "available"}
        >
          Done
        </button>
        <div ref={mapRef} id="map" className="h-96 w-full rounded-lg"></div>
      </main>
    </>
  );
}

export const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

export const debouncedCheckUsernameExists = debounce(
  (
    username: string,
    setUsername: Dispatch<
      SetStateAction<{
        value: string;
        state: "loading" | "unavailable" | "available" | null;
      }>
    >,
    checkUsername: () => Promise<{ data: User }>,
    setErrors?: Dispatch<any>
  ) => {
    const inputVal = username.trim().toLowerCase();
    console.log("checking regex", inputVal);
    if (!usernameRegex.test(inputVal)) {
      console.log("checking regex fail", inputVal);
      setUsername((prev) => ({ ...prev, state: "unavailable" }));
      setErrors?.((prev: any) => ({
        ...prev,
        username:
          "Username must be between 3 and 20 characters long and can only contain letters, numbers and underscores",
      }));
      return;
    }
    console.log("checking username");
    checkUsername().then((res) => {
      setUsername((prev) => ({ ...prev, state: res.data ? "unavailable" : "available" }));
      if (res.data)
        setErrors?.((prev: any) => ({
          ...prev,
          username: "Username taken",
        }));
      else setErrors?.((prev: any) => ({ ...prev, username: "" }));
    });
  },
  700
);
