let map: google.maps.Map, marker: google.maps.Marker, geocoder: google.maps.Geocoder;
let initMapReturnVal: { map: google.maps.Map; marker: google.maps.Marker };
export async function initMap(
  mapElement: HTMLDivElement,
  inputElement: HTMLInputElement
): Promise<{ map: google.maps.Map; marker: google.maps.Marker }> {
  if (initMapReturnVal) {
    return initMapReturnVal;
  }
  //@ts-ignore
  const [{ Map }] = await Promise.all([
    google.maps.importLibrary("maps"),
    google.maps.importLibrary("marker"),
    google.maps.importLibrary("places"),
  ]);

  const center = { lat: 28.612894, lng: 77.229446 };

  const autocomplete = new google.maps.places.Autocomplete(inputElement);

  map = new Map(mapElement, {
    center,
    zoom: 10,
    disableDefaultUI: true,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#5bbaff" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#1FB2A5" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ],
  });

  marker = new google.maps.Marker({
    position: center,
    map,
    title: "Home",
  });

  geocoder = new google.maps.Geocoder();

  map.addListener("click", (e: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
    marker.setPosition(e.latLng);
    geocoder
      .geocode({ location: e.latLng })
      .then((response) => {
        if (response.results[0]) {
          inputElement.value = response.results[0].formatted_address;
        } else {
          console.warn("No addresses found for placed marker");
        }
      })
      .catch((e) => console.error("Geocoder failed due to: " + e));
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    } else {
      const lat = place.geometry.location?.lat(),
        lng = place.geometry.location?.lng();
      if (lat && lng) {
        const latLng = new google.maps.LatLng(lat, lng);
        map.setCenter(latLng);
        map.setZoom(18);
        marker.setPosition(latLng);
      }
    }
  });
  initMapReturnVal = { map, marker };
  return initMapReturnVal;
}

export function getMarkerPosition() {
  const pos = { lat: marker.getPosition()?.lat(), lng: marker.getPosition()?.lng() };
  return pos;
}

export function getCurrentPosition(
  inputElement: HTMLInputElement,
  setLocationLoading: (loading: boolean) => void,
  options?: PositionOptions
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLoading(false);
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(pos);
        map.setZoom(18);
        marker.setPosition(pos);
        geocoder
          .geocode({ location: pos })
          .then((response) => {
            if (response.results[0]) {
              inputElement.value = response.results[0].formatted_address;
            } else {
              console.warn("No addresses found for placed marker");
            }
          })
          .catch((e) => console.error("Geocoder failed due to: " + e));
        resolve(pos);
      },
      (error) => {
        setLocationLoading(false);
        return reject(error);
      },
      options
    );
  });
}
