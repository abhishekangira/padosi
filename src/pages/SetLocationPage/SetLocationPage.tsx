import { BiCurrentLocation } from "react-icons/bi";
import { getCurrentPosition } from "./locationUtils";
import { useSetLocationPage } from "./useSetLocationPage";
import Script from "next/script";
import { useLayout } from "@/lib/hooks/useLayout";

const gmapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function SetLocationPage() {
  // useLayout({ noLayout: true });
  const { mapRef, addressInputRef, locationLoading, setLocationLoading, handleSubmit } =
    useSetLocationPage();
  return (
    <>
      <Script id="google-maps-script">
        {`(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src="https://maps."+c+"apis.com/maps/api/js?"+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({key: '` +
          gmapsApiKey +
          `',});`}
      </Script>
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 p-4">
        <h1 className="self-start text-lg">
          Auto detect, type your address or click on the map to set your location
        </h1>
        <div className="input-group">
          <input type="text" ref={addressInputRef} className="input w-full" autoComplete="off" />
          <div className="tooltip tooltip-left" data-tip="Auto Detect Location">
            <button
              className={`btn-square btn rounded-l-none text-xl text-primary ${
                locationLoading ? "loading" : ""
              }`}
              onClick={async () => {
                if (navigator.geolocation) {
                  await getCurrentPosition(setLocationLoading, {
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
        <button className="btn-primary btn-sm btn" onClick={handleSubmit}>
          Confirm Location
        </button>
        <div ref={mapRef} id="map" className="h-96 w-full rounded-lg"></div>
      </main>
    </>
  );
}
