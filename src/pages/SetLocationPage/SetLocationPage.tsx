import FullPageLoader from "@/components/FullPageLoader";
import { TopBar } from "@/components/TopBar";
import { BiCurrentLocation } from "react-icons/bi";
import { setUserPosition, getCurrentPosition } from "./locationUtils";
import { useSetLocationPage } from "./useSetLocationPage";

export function SetLocationPage() {
  const { loading, mapRef, addressInputRef, locationLoading, setLocationLoading } =
    useSetLocationPage();
  if (loading) return <FullPageLoader />;
  return (
    <>
      <TopBar title="Set Location" />
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 p-4">
        <h1 className="self-start text-lg">
          Auto detect, type your address or click on the map to set your location
        </h1>
        <div className="input-group">
          <input type="text" ref={addressInputRef} className="input w-full" autoComplete="off" />
          <div className="tooltip" data-tip="Auto Detect Location">
            <button
              className={`btn-square btn text-xl text-primary ${locationLoading ? "loading" : ""}`}
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
        <button className="btn-primary btn-sm btn" onClick={setUserPosition}>
          Confirm Location
        </button>
        <div ref={mapRef} id="map" className="h-96 w-full rounded-lg"></div>
      </main>
    </>
  );
}
