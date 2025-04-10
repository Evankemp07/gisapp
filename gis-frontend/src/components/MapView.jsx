import React, { useCallback } from "react";
import { marked } from "marked";
import {
  cleanTitle,
  parseColoredText,
  extractPinColor,
  darkenColor,
} from "../utils/helpers";
import {
  SVG_ICON_URL,
  MEDIA_BASE_URL,
} from "../utils/constants";

const MapView = ({
  isLoaded,
  locations,
  mapRef,
  infoWindowRef,
  setIsBannerHidden,
  setMenuOpen,
  analytics,
}) => {
  const initMap = useCallback(async () => {
    if (!window.google || locations.length === 0) return;

    const { Map, InfoWindow } = window.google.maps;
    const { AdvancedMarkerElement } = window.google.maps.marker;

    const latSum = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const lngSum = locations.reduce((sum, loc) => sum + loc.longitude, 0);
    const center = {
      lat: latSum / locations.length,
      lng: lngSum / locations.length,
    };

    const mapInstance = new Map(document.getElementById("map"), {
      center,
      zoom: 10,
      mapId: "4504f8b37365c3d0",
    });

    const infoWindow = new InfoWindow();
    mapRef.current = mapInstance;
    infoWindowRef.current = infoWindow;

    if (!document.getElementById("halo-style")) {
        const style = document.createElement("style");
        style.id = "halo-style";
        style.innerHTML = `
          @keyframes rotate-halo {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      

    locations.forEach((location) => {
      const pinColor = extractPinColor(location.name) || "#D3D3D3";
      const borderColor = darkenColor(pinColor, 20);
      const cleanedTitle = cleanTitle(location.name);

      const customMarker = document.createElement("div");
      customMarker.style.width = "25px";
      customMarker.style.height = "25px";
      customMarker.style.borderRadius = "50%";
      customMarker.style.backgroundColor = pinColor;
      customMarker.style.border = `2px solid ${borderColor}`;

      const img = document.createElement("img");
      img.src = SVG_ICON_URL;
      img.style.width = "22px";
      img.style.height = "28px";

      customMarker.appendChild(img);

      const marker = new AdvancedMarkerElement({
        map: mapInstance,
        position: { lat: location.latitude, lng: location.longitude },
        title: cleanedTitle,
        content: customMarker,
      });

      marker.addListener("gmp-click", () => {
        setIsBannerHidden(true);
        setMenuOpen(false);

        const description = marked.parse(location.description || "");
        const infoContent = `
          <div style="padding: 10px; max-width: 300px">
            <h2>${cleanedTitle}</h2>
            <p style="margin-bottom: 6px; font-weight: bold;">${location.address}</p>
            <div>${parseColoredText(description)}</div>
            ${location.image ? `<img src="${MEDIA_BASE_URL}${location.image}" style="width: 100%; margin-top: 10px; border-radius: 8px;"/>` : ""}
          </div>
        `;

        infoWindow.setContent(infoContent);
        infoWindow.open(mapInstance, marker);

        if (analytics) {
          import("firebase/analytics").then(({ logEvent }) => {
            logEvent(analytics, "light_show_clicked", {
              location_name: cleanedTitle,
              is_animated: location.is_animated,
            });
          });
        }
      });
    });
  }, [locations]);

  React.useEffect(() => {
    if (isLoaded && locations.length > 0) initMap();
  }, [isLoaded, locations, initMap]);

  return <div id="map" style={{ width: "100%", height: "100%" }} />;
};

export default MapView;
