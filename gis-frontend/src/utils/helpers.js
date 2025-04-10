import { marked } from "marked";

export const COLOR_MAP = {
  "/r": "#b30000",
  "/o": "orange",
  "/y": "yellow",
  "/g": "#006400",
  "/b": "blue",
  "/p": "purple",
  "/lr": "#ff6666",
  "/lo": "#ffa500",
  "/ly": "#ffff66",
  "/lg": "#66ff66",
  "/lb": "#66b3ff",
  "/lp": "#ff99ff",
};

export const cleanTitle = (title) =>
  title.replace(/\/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)/g, "").trim();

export const parseColoredText = (text) => {
  if (!text) return "";
  return text.replace(
    /\/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)(.*?)\/\1/g,
    (match, tag, content) => {
      const color = COLOR_MAP[`/${tag}`] || "black";
      return `<span style="color: ${color};">${content.trim()}</span>`;
    }
  );
};

export const extractPinColor = (title) => {
  const match = title.match(/\/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)/);
  return match ? COLOR_MAP[`/${match[1]}`] || null : null;
};

export const darkenColor = (color, percent = 20) => {
  const temp = document.createElement("div");
  temp.style.color = color;
  document.body.appendChild(temp);
  const computed = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);

  const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return color;

  const [_, r, g, b] = match.map(Number);
  const factor = 1 - percent / 100;
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
};

export const buildInfoWindowContent = (location) => {
  const cleanedTitle = cleanTitle(location.name);
  const formattedAddress = location.address
    ? location.address.replace(/\r\n/g, ", ")
    : "No address provided";
  const rawDescription = location.description?.trim() || "";
  const formattedDescription = rawDescription
    ? parseColoredText(
        marked
          .parse(rawDescription.replace(/\n/g, "  \n"))
          .replace(/^\s*<p>\s*<\/p>\s*|\s*<p>\s*<\/p>\s*$/g, "")
          .trim()
      )
    : "";

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  const isAnimated = location.is_animated;

  const voteBadge = location.is_contestant
    ? `<a href="https://business.cvballiance.org/events/details/deck-the-town-holiday-light-contest-voting-40538" target="_blank" rel="noopener noreferrer">
        <div style="margin-top:10px; border-radius:12px; border:2px solid red; padding:8px; background:#221b16; text-align:center; color:white;">
          🎄 Vote For This Light Show 🎄
        </div>
      </a>`
    : "";

  const imageHtml = location.image
    ? `<img src="https://hideously-pleased-puma.ngrok-free.app${location.image}" 
             alt="Light Show Image" 
             style="width:100%; margin-top:10px; border-radius:8px;" />`
    : "";

  const buttonRow = `
    <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center;">
      <a id="share-light-show"
        style="padding: 10px 16px; background: #b30000; color: white; border-radius: 8px; font-weight: bold; text-decoration: none; cursor: pointer;">
        Share
      </a>
      <a id="get-directions" href="${directionsUrl}" target="_blank"
        style="padding: 10px 16px; background: #006400; color: white; border-radius: 8px; font-weight: bold; text-decoration: none;">
        Get Directions
      </a>
    </div>
  `;

  const icon = isAnimated
    ? `<div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: repeating-conic-gradient(red 0deg 20deg, green 20deg 40deg, white 40deg 60deg); animation: rotate-halo 18s linear infinite; z-index: 0;"></div>`
    : "";

  const musicIcon = `<div style="position: relative; width: 40px; height: 40px; z-index: 1;">
    <div style="width: 32px; height: 32px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid ${
      isAnimated ? "none" : "red"
    };">
      <img src="https://webstockreview.net/images/clipart-music-muzik-17.png" alt="Note" style="width: 16px; height: 16px;" />
    </div>
  </div>`;

  return `
    <div style="font-family: sans-serif; padding: 0; margin: 0; width: 250px;">
      <div style="background: #b30000; color: white; padding: 10px; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 1rem;">${cleanedTitle}</span>
        <div style="position: relative;">${icon}${musicIcon}</div>
      </div>
      <div style="padding: 10px; background: #f8f8f8; font-size: 0.9rem; font-weight: bold;">
        <div>${formattedAddress}</div>
        <div style="margin-top: 10px;">${formattedDescription}</div>
        ${imageHtml}
        ${voteBadge}
        ${buttonRow}
      </div>
    </div>
  `;
};
