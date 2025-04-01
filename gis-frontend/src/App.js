import React, { useEffect, useState, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { marked } from "marked";

const API_URL = "https://hideously-pleased-puma.ngrok-free.app/api/locations/";
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const SVG_ICON_URL =
  "https://hideously-pleased-puma.ngrok-free.app/lightshow/santahat.svg";

const libraries = ["maps", "marker"];

const COLOR_MAP = {
  "/r": " #b30000",
  "/o": "orange",
  "/y": "yellow",
  "/g": " #006400",
  "/b": "blue",
  "/p": "purple",
  "/lr": "#ff6666",
  "/lo": "#ffa500",
  "/ly": "#ffff66",
  "/lg": "#66ff66",
  "/lb": "#66b3ff",
  "/lp": "#ff99ff",
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
  const [isBannerHidden, setIsBannerHidden] = useState(false);


  const mapRef = useRef(null);
  const infoWindowRef = useRef(null);

  const darkenColor = (color, percent = 20) => {
    const temp = document.createElement("div");
    temp.style.color = color;
    document.body.appendChild(temp);
  
    const computed = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);
  
    const match = computed.match(/^rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);
    if (!match) return color;
  
    const [_, r, g, b] = match.map(Number);
    const factor = 1 - percent / 100;
  
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  };
  

  const extractPinColor = (title) => {
    const match = title.match(/\/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)/);
    return match ? COLOR_MAP[`/${match[1]}`] || null : null;
  };

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

  const getGeographicCenter = (locations) => {
    const latSum = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const lngSum = locations.reduce((sum, loc) => sum + loc.longitude, 0);
    return {
      lat: latSum / locations.length,
      lng: lngSum / locations.length,
    };
  };
  
  const getClosestLocationToCenter = (locations, center) => {
    let closest = locations[0];
    let minDistance = Number.MAX_VALUE;
  
    locations.forEach((loc) => {
      const distance = Math.sqrt(
        Math.pow(center.lat - loc.latitude, 2) + Math.pow(center.lng - loc.longitude, 2)
      );
      if (distance < minDistance) {
        closest = loc;
        minDistance = distance;
      }
    });
  
    return closest;
  };
  

  const initMap = useCallback(async () => {
    if (!window.google || locations.length === 0) return;
    const haloStyleId = "red-green-halo-style";
    if (!document.getElementById(haloStyleId)) {
      const style = document.createElement("style");
      style.id = haloStyleId;
      style.innerHTML = `
        @keyframes rotate-halo {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    
    

    const { ColorScheme } = await window.google.maps.importLibrary("core");
    const { Map, InfoWindow } = window.google.maps;
    const { AdvancedMarkerElement} = window.google.maps.marker;
  
    const centerPoint = getGeographicCenter(locations);
    const closestToCenter = getClosestLocationToCenter(locations, centerPoint);
  
    const mapInstance = new Map(document.getElementById("map"), {
      center: { lat: closestToCenter.latitude, lng: closestToCenter.longitude },
      zoom: 10,
      mapId: "4504f8b37365c3d0",
      colorScheme: ColorScheme.FOLLOW_SYSTEM,
    });

    const infoWindowInstance = new InfoWindow();
    mapRef.current = mapInstance;
    infoWindowRef.current = infoWindowInstance;

    locations.forEach((location) => {
      const isAnimated = location.is_animated;
      const extractedColor = extractPinColor(location.name);

      const pinColor = extractedColor || (" #D3D3D3");
      const borderColor = darkenColor(pinColor, 20);
      const cleanedTitle = cleanTitle(location.name);

      const glyphImg = document.createElement("img");
      glyphImg.src = SVG_ICON_URL;
      glyphImg.style.width = "25px";
      glyphImg.style.height = "25px";

      const customMarker = document.createElement("div");
      customMarker.className = "custom-marker";
      customMarker.style.display = "flex";
      customMarker.style.alignItems = "center";
      customMarker.style.justifyContent = "center";
      customMarker.style.width = "25px";
      customMarker.style.height = "25px";
      customMarker.style.borderRadius = "50%";
      customMarker.style.backgroundColor = pinColor;
      customMarker.style.border = `2px solid ${borderColor}`;
      customMarker.style.boxShadow = isAnimated

      if (isAnimated) {
        customMarker.style.position = "relative";
      
        const halo = document.createElement("div");
        halo.style.position = "absolute";



        halo.style.width = "33px";
        halo.style.height = "33px";
        halo.style.borderRadius = "50%";
        halo.style.zIndex = "-1";
        halo.style.background = `
          repeating-conic-gradient(
            red 0deg 20deg,
            green 30deg 50deg
          )
        `;

        halo.style.animation = "rotate-halo 15s linear infinite";
        halo.style.pointerEvents = "none";
      
        customMarker.appendChild(halo);
      }
      
      
      
      
      
  



      const hatImg = document.createElement("img");
      hatImg.src = SVG_ICON_URL;
      hatImg.style.width = "22px";
      hatImg.style.height = "28px";

      customMarker.appendChild(hatImg);

      const marker = new AdvancedMarkerElement({
        map: mapInstance,
        position: { lat: location.latitude, lng: location.longitude },
        title: cleanedTitle,
        content: customMarker,
        gmpClickable: true,
        zIndex: Math.round(location.latitude * -100000),
      });
      
      

      marker.addEventListener("gmp-click", () => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
        const formattedAddress = location.address ? location.address.replace(/\r\n/g, ", ") : "No address provided";
        const formattedDescription = location.description
          ? parseColoredText(marked.parse(location.description.replace(/\n/g, "  \n")))
          : "";
        const nonAnimatedMessage = isAnimated
          ? `<p style="
              color: green; 
              font-weight: bold;
              border-radius: 12px;
              border: 2px solid #006400;
              padding: 10px 12px;
              text-align: center;
              max-width: 240px;
              ">
              This Light Show Dances to Music!</p>`
          : "";
          const imageHtml = location.image
          ? `<div style="text-align: center; margin-top: 12px;">
               <img src="${location.image}" alt="Light Show Image" style="
                 max-width: 240px;
                 border-radius: 12px;
                 border: 2px solid #b30000;
               " />
             </div>`
          : '';
        
      

          const buttonRowHtml = `
            <div style="
              display: flex;
              gap: 8px;
              justify-content: center;
              margin-top: 12px;
            ">
              <button id="share-light-show"
                style="
                  flex: 1;
                  padding: 10px 15px;
                  background-color: #b30000;
                  color: white;
                  font-size: 14px;
                  font-weight: bold;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  transition: background-color 0.2s ease-in-out;
                "
                onmouseover="this.style.backgroundColor='#b30000'"
                onmouseout="this.style.backgroundColor='#b30000'"
              >
                Share This Display

              </button>
              <a href="${directionsUrl}" target="_blank"
                style="
                  flex: 1;
                  text-align: center;
                  padding: 10px 15px;
                  background-color: #006400;
                  color: white;
                  font-size: 14px;
                  font-weight: bold;
                  text-decoration: none;
                  border-radius: 6px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  transition: background-color 0.2s ease-in-out;
                "
                onmouseover="this.style.backgroundColor=' #006400'"
                onmouseout="this.style.backgroundColor=' #006400'"
              >
                Get Directions
              </a>
            </div>
          `;

          const voteBadge = location.is_contestant
              ? `<div style="text-align: center; margin-top: 12px;">
                  <a href="https://business.cvballiance.org/events/details/deck-the-town-holiday-light-contest-voting-40538" target="_blank" rel="noopener noreferrer">
                    <img src="https://hideously-pleased-puma.ngrok-free.app/lightshow/vote.png" 
                        alt="Vote" 
                        style="max-width: 240px; border-radius: 12px;
              border: 2px solid #b30000; cursor: pointer;" />
                  </a>
                </div>`
              : "";


          const infoContent = `
          <div style="
            font-family: 'Comic Sans MS', 'Segoe UI', sans-serif;
            padding: 16px;
            max-width: 320px;
            font-weight: bold;
            background: #f0f0f0;
            border-radius: 12px;
            color: #333;
          ">
            <h2 style="
              margin-top: 0;
              font-size: 20px;
              color: #b30000;
              text-align: center;
              border-bottom: 2px dashed #b30000;
              padding-bottom: 8px;
            ">
              ${cleanedTitle}
            </h2>
        
            <div style="
              font-size: 14px;
              background: #f0f0f0;
              border: 2px solid #006400;
              border-radius: 12px;
              padding: 10px 12px;
              font-weight: bold;
              margin-bottom: 12px;
              color: #b30000;
            ">
              ${formattedAddress}
            </div>
        
            ${formattedDescription ? `
              <div style="
                font-size: 13px;
                line-height: 1;
                color: #006400;
                background: #f0f0f0;
                border: 2px solid #b30000;
                border-radius: 12px;
                padding: 10px 12px;
                margin-bottom: 12px;
              ">
                ${formattedDescription}
              </div>
            ` : ""}
            ${imageHtml}
            ${voteBadge}
            ${nonAnimatedMessage}
            ${buttonRowHtml}
</div>

        `;
        
        
        

      
        infoWindowInstance.close();
        infoWindowInstance.setContent(infoContent);
        infoWindowInstance.open(mapInstance, marker);
      
        window.google.maps.event.addListenerOnce(infoWindowInstance, 'domready', () => {
          const shareButton = document.getElementById('share-light-show');
          if (shareButton) {
            shareButton.addEventListener('click', () => {
              const shareUrl = `${window.location.origin}${window.location.pathname}?locationId=${location.id}`;
              const shareData = {
                title: `🎄 ${cleanedTitle}`,
                text: `Check out this awesome light show! 🎄 ${cleanedTitle}`,
                url: shareUrl,
              };
      
              if (navigator.share) {
                navigator.share(shareData)
                  .then(() => console.log('Shared successfully!'))
                  .catch((error) => console.error('Sharing failed:', error));
              } else {
                alert("Sharing isn't supported on this browser.");
              }
            });
          }
        });
      });
    });

    setTimeout(() => window.dispatchEvent(new Event("resize")), 500);

    
  }, [locations]);

  useEffect(() => {
    if (!isLoaded || locations.length === 0) return;
  
    initMap().then(() => {
      const params = new URLSearchParams(window.location.search);
      const sharedLocationId = params.get("locationId");
  
      if (!sharedLocationId) return;
  
      const sharedLocation = locations.find(
        (loc) => loc.id === parseInt(sharedLocationId)
      );
  
      if (!sharedLocation || !window.google) return;
  
      const mapInstance = mapRef.current;
      const infoWindow = infoWindowRef.current;
  
      if (!mapInstance || !infoWindow) return;
  
      const cleanedTitle = cleanTitle(sharedLocation.name);
      const formattedAddress = sharedLocation.address
        ? sharedLocation.address.replace(/\r\n/g, ", ")
        : "No address provided";
      const formattedDescription = sharedLocation.description
        ? parseColoredText(marked.parse(sharedLocation.description.replace(/\n/g, "  \n")))
        : "";
      const isAnimated = sharedLocation.is_animated;
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${sharedLocation.latitude},${sharedLocation.longitude}`;
      const nonAnimatedMessage = !isAnimated
        ? `<div style="
            background: #f0f0f0;
            border: 2px solid #006400;
            border-radius: 12px;
            padding: 10px 12px;
            color: #b30000;
            font-weight: bold;
            text-align: center;
            margin-bottom: 12px;">
            This light display does <u>not</u> dance to music
          </div>`
        : "";
      const imageHtml = sharedLocation.image
        ? `<img src="${sharedLocation.image}" alt="Light Show Image" style="
            max-width: 240px;
            object-fit: cover;
            border-radius: 12px;
            border: 2px solid #b30000;
            margin-top: 10px;
          " />`
        : "";
        const infoContent = `
        <div style="
          font-family: 'Comic Sans MS', 'Segoe UI', sans-serif;
          padding: 16px;
          max-width: 320px;
          font-weight: bold;
          background: #f0f0f0;
          border-radius: 12px;

          color: #333;
        ">
          <h2 style="
            margin-top: 0;
            font-size: 20px;
            color: #b30000;
            text-align: center;
            border-bottom: 2px dashed #b30000;
            padding-bottom: 8px;
          ">
            ${cleanedTitle}
          </h2>
      
          <div style="
            font-size: 14px;
            
            border: 2px solid #006400;
            border-radius: 12px;
            padding: 10px 12px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #b30000;
          ">
            ${formattedAddress}
                  <a href="${directionsUrl}" target="_blank"
                  style="
                    display: block;
                    text-align: center;
                    padding: 10px 15px;
                    background-color: #006400;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 6px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: background-color 0.2s ease-in-out;
                    margin-top: 12px;
                  "
                  onmouseover="this.style.backgroundColor=' #006400'"
                  onmouseout="this.style.backgroundColor=' #006400'"
                >
                  Get Directions
                </a>
          </div>
      
          ${formattedDescription ? `
            <div style="
              font-size: 13px;
              line-height: 1;
              color: #006400;
              
              border: 2px solid #b30000;
              border-radius: 12px;
              padding: 10px 12px;
              margin-bottom: 12px;
            ">
              ${formattedDescription}
            </div>
          ` : ""}
      
          ${nonAnimatedMessage}
          ${imageHtml}
        </div>
      `;
  
      const invisibleMarker = new window.google.maps.Marker({
        position: {
          lat: sharedLocation.latitude,
          lng: sharedLocation.longitude,
        },
        map: mapInstance,
        opacity: 0,
        clickable: false,
        zIndex: -9999,
      });
  
      mapInstance.setCenter({
        lat: sharedLocation.latitude,
        lng: sharedLocation.longitude,
      });
      mapInstance.setZoom(14);
  
      infoWindow.setContent(infoContent);
      infoWindow.open(mapInstance, invisibleMarker);
    });
  }, [isLoaded, locations, initMap]);
  
  
  
  

  return (
    <div style={{ width: "100vw", height: mapHeight, position: "relative" }}>

<div
  style={{
    position: "fixed",
    bottom: isBannerHidden ? "-55px" : "10px",
    left: "10px",
    transition: "bottom 0.3s ease-in-out",
    zIndex: 1000,
  }}
>
<div
  onClick={() => setIsBannerHidden(!isBannerHidden)}
  style={{
    position: "fixed",
    bottom: "10px",
    left: "10px",
    backgroundColor: "rgb(129, 131, 129)",
    color: "white",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "14px",
    zIndex: 1001,
    padding: "4px 10px",
    gap: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "transform 0.3s ease",
  }}
  title={isBannerHidden ? "Show" : "Hide"}
>
  <span
    style={{
      display: "inline-block",
      transform: isBannerHidden ? "rotate(0deg)" : "rotate(180deg)",
      transition: "transform 0.3s ease",
      fontSize: "16px",
    }}
  >
    ▲
  </span>
  <span style={{ fontWeight: "bold" }}>
    {isBannerHidden ? "Show Lengend" : "Hide Legend"}
  </span>
</div>



<div
  style={{
    position: "fixed",
    bottom: isBannerHidden ? "-150px" : "45px",
    left: "10px",
    backgroundColor: "rgba(129, 131, 129, 0.81)",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "normal",
    color: "rgb(110, 110, 110)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
    transition: "bottom 0.3s ease-in-out",
    zIndex: 1000,
  }}
>
  {/* Legend Items */}
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <img
        src="https://hideously-pleased-puma.ngrok-free.app/lightshow/animated.png"
        alt="Animated"
        style={{ height: "20px" }}
      />
      <span style={{ fontSize: "12px", color: "#000" }}><strong>= Animated</strong></span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <img
        src="https://hideously-pleased-puma.ngrok-free.app/lightshow/noncontestant.png"
        alt="Non-Contestant"
        style={{ height: "20px" }}
      />
      <span style={{ fontSize: "12px", color: "#000" }}><strong>= Non-Contestant</strong></span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <img
        src="https://hideously-pleased-puma.ngrok-free.app/lightshow/contestant.png"
        alt="Contestant"
        style={{ height: "20px" }}
      />
      <span style={{ fontSize: "12px", color: "#000" }}><strong>= Contestant</strong></span>
    </div>
  </div>

  {/* Logo and Copyright */}
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <img
      src="https://hideously-pleased-puma.ngrok-free.app/lightshow/LMA%20logo%202025.png"
      alt="Lights Music Action Logo"
      style={{ height: "20px", width: "auto", borderRadius: "3px" }}
    />
    <div style={{ lineHeight: 1.2 }}>
      <a
        href="https://www.lightsmusicaction.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "rgb(0, 0, 0)", textDecoration: "none" }}
      >
        <div><strong>Lights Music Action</strong></div>
        <div>©2025 Evan Kemp</div>
      </a>
    </div>
  </div>
</div>
</div>




      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "#b30000",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            fontSize: "25px",
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
            <h3 style={{ marginBottom: "15px", color: "#333" }}>🎄 Did we miss your favorite? Submit the form below to add it to the map! 🎄</h3>
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
