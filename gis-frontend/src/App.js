import React, { useEffect, useState, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { marked } from "marked";

const API_URL = "https://hideously-pleased-puma.ngrok-free.app/api/locations/";
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const SVG_ICON_URL =
  "https://cdn.discordapp.com/attachments/1164343558346641520/1351394711000186982/santahat.svg?ex=67db8966&is=67da37e6&hm=f70d4ee6a8485259622837453af17ac29141550d35220a517895cd7908167e89&";

const libraries = ["maps", "marker"];

const COLOR_MAP = {
  "/r": "red",
  "/o": "orange",
  "/y": "yellow",
  "/g": "green",
  "/b": "blue",
  "/p": "purple",
  "/lr": "#ff6666",
  "/lo": "#ffa500",
  "/ly": "#ffff66",
  "/lg": "#66ff66",
  "/lb": "#66b3ff",
  "/lp": "#ff99ff",
};

const extractPinColor = (title) => {
  const match = title.match(/\/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)/);
  return match ? COLOR_MAP[`/${match[1]}`] || null : null;
};

const cleanTitle = (title) => title.replace(/\/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)/g, "").trim();

const parseColoredText = (text) => {
  if (!text) return "";
  return text.replace(/\/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)(.*?)\/\1/g, (match, tag, content) => {
    const color = COLOR_MAP[`/${tag}`] || "black";
    return `<span style="color: ${color};">${content.trim()}</span>`;
  });
};


const App = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const [locations, setLocations] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [mapHeight, setMapHeight] = useState(window.innerHeight);
  const [formData, setFormData] = useState({
    lightShowName: "",
    name: "",
    email: "",
    address: "",
    description: "",
  });

  const mapRef = useRef(null);
  const infoWindowRef = useRef(null);

  const handleSubmit = () => {
    const mailtoLink = `mailto:addtomap@lightsmusicaction.com?subject=New%20Light%20Show%20Submission&body=
      Light Show Name: ${encodeURIComponent(formData.lightShowName)}%0A
      Name: ${encodeURIComponent(formData.name)}%0A
      Email: ${encodeURIComponent(formData.email)}%0A
      Address: ${encodeURIComponent(formData.address)}%0A
      Description: ${encodeURIComponent(formData.description)}`;
    setFormOpen(false);
    setMenuOpen(!menuOpen);
    window.location.href = mailtoLink;
  };

  const handleChange = (e) => {
    setFormData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const updateHeight = () => setMapHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error("Error fetching locations:", error));
  }, []);

  const initMap = useCallback(() => {
    if (!window.google || locations.length === 0) return;

    const { Map, InfoWindow } = window.google.maps;
    const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;

    const mapInstance = new Map(document.getElementById("map"), {
      center: { lat: locations[0]?.latitude || 39.9, lng: locations[0]?.longitude || -77.5 },
      zoom: 10,
      mapId: "4504f8b37365c3d0",
    });

    const infoWindowInstance = new InfoWindow();
    mapRef.current = mapInstance;
    infoWindowRef.current = infoWindowInstance;

    locations.forEach((location) => {
      const isAnimated = location.is_animated;
      const extractedColor = extractPinColor(location.name);

      const pinColor = extractedColor || (isAnimated ? "#228B22" : "#D3D3D3");
      const borderColor = extractedColor || (isAnimated ? "#006400" : "#A9A9A9");
      const cleanedTitle = cleanTitle(location.name);

      const glyphImg = document.createElement("img");
      glyphImg.src = SVG_ICON_URL;
      glyphImg.style.width = "20px";
      glyphImg.style.height = "25px";

      const pinElement = new PinElement({
        glyph: glyphImg,
        background: pinColor,
        borderColor: borderColor,
      });

      const marker = new AdvancedMarkerElement({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapInstance,
        title: cleanedTitle,
        content: pinElement.element,
        gmpClickable: true,
      });

      marker.addEventListener("gmp-click", () => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
        const formattedAddress = location.address ? location.address.replace(/\r\n/g, ", ") : "No address provided";
        const formattedDescription = location.description
          ? parseColoredText(marked.parse(location.description.replace(/\n/g, "  \n")))
          : "";
        const nonAnimatedMessage = !isAnimated ? `<p style="color: red; font-weight: bold;">This light display does not dance to music</p>` : "";

        const infoContent = `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin-bottom: 5px;">${cleanedTitle}</h3>
            <p><strong>Address:</strong> ${formattedAddress}</p>
            <div>${formattedDescription}</div>
            ${nonAnimatedMessage}
            <a href="${directionsUrl}" target="_blank"
               style="display: inline-block; margin-top: 8px; padding: 8px 12px; background-color: #007bff; 
                      color: white; text-align: center; text-decoration: none; font-size: 14px; 
                      font-weight: bold; border-radius: 5px; transition: background-color 0.2s;">
              Get Directions
            </a>
          </div>
        `;

        infoWindowInstance.close();
        infoWindowInstance.setContent(infoContent);
        infoWindowInstance.open(mapInstance, marker);
      });
    });

    setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
  }, [locations]);

  useEffect(() => {
    if (isLoaded && locations.length > 0) {
      initMap();
    }
  }, [isLoaded, locations, initMap]);

  return (
    <div style={{ width: "100vw", height: mapHeight, position: "relative" }}>
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "#007bff",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ☰ Menu
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              background: "white",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              borderRadius: "5px",
              minWidth: "180px",
              marginTop: "5px",
              textAlign: "left",
            }}
          >
            <a href="mailto:map@lightsmusicaction.com" 
               style={{ display: "block", padding: "10px", textDecoration: "none", color: "#007bff" }}>
              📩 Contact Us
            </a>
            <a href="https://lightsmusicaction.com" target="_blank" rel="noopener noreferrer" 
               style={{ display: "block", padding: "10px", textDecoration: "none", color: "#007bff", borderTop: "1px solid #ddd" }}>
              🌐 Visit Website
            </a>
            <button 
              onClick={() => setFormOpen(true)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "#007bff",
                cursor: "pointer",
                fontSize: "16px",
                borderTop: "1px solid #ddd",
              }}
            >
              ➕ Add Light Show
            </button>
          </div>
        )}
      </div>

      <div id="map" style={{ width: "100%", height: "100%" }}></div>


      {formOpen && (
        <div 
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center",
            alignItems: "center", zIndex: 1000
          }}
        >
          <div 
            style={{
              background: "white", padding: "20px", borderRadius: "10px", 
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", width: "350px", textAlign: "center"
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#333" }}>🎄 Add Your Light Show</h3>
            <input type="text" name="lightShowName" placeholder="Light Show Name" value={formData.lightShowName} onChange={handleChange} style={{ width: "85%", padding: "8px", marginBottom: "8px" }} />
            <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} style={{ width: "85%", padding: "8px", marginBottom: "8px" }} />
            <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} style={{ width: "85%", padding: "8px", marginBottom: "8px" }} />
            <input type="text" name="address" placeholder="Light Show Address" value={formData.address} onChange={handleChange} style={{ width: "85%", padding: "8px", marginBottom: "8px" }} />
            <textarea name="description" placeholder="Light Show Description" value={formData.description} onChange={handleChange} style={{ width: "85%", padding: "8px", marginBottom: "8px", height: "80px" }}></textarea>
            <button onClick={handleSubmit} style={{ background: "#007bff", color: "white", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>Submit</button>
            <button onClick={() => setFormOpen(false)} style={{ background: "#ddd", color: "black", padding: "10px", borderRadius: "5px", cursor: "pointer", marginLeft: "10px" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
