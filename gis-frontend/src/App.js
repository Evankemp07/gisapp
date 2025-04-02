import React, { useEffect, useState, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { marked } from "marked";
import { logEvent } from "firebase/analytics";



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJPNpQZ1aXv_s27WVEZATPyJUlTgeYfFU",
  authDomain: "lightshowlocator.firebaseapp.com",
  projectId: "lightshowlocator",
  storageBucket: "lightshowlocator.firebasestorage.app",
  messagingSenderId: "17368863391",
  appId: "1:17368863391:web:ec966b591c62007b5448aa",
  measurementId: "G-QL8NXT3S4Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const API_URL = "https://hideously-pleased-puma.ngrok-free.app/api/locations/";
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const SVG_ICON_URL =
  "https://hideously-pleased-puma.ngrok-free.app/lightshow/santahat.svg";
const MEDIA_BASE_URL = "https://hideously-pleased-puma.ngrok-free.app";


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


const buildInfoWindowContent = (location) => {
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

  let borderToggle = true;
  const nextBorder = () => {
    const color = borderToggle ? "#006400" : "#b30000";
    borderToggle = !borderToggle;
    return color;
  };

  const formattedAddressHtml = `
    <div style="font-size: 0.9rem; border: 2px solid ${nextBorder()}; border-radius: 12px; padding: 0.75rem; color: #b30000; background: #fff;">
      ${formattedAddress}
    </div>
  `;

  const formattedDescriptionHtml = formattedDescription
    ? `
    <div style="font-size: 0.85rem; line-height: 1; color: #006400; background: #fff; border: 2px solid ${nextBorder()}; border-radius: 12px; padding: 0.75rem;">
      <div>${formattedDescription}</div>
    </div>`
    : "";

    const imageHtml = location.image
    ? `
    <div style="box-sizing: border-box; width: 100%; aspect-ratio: 16 / 9; border: 2px solid ${nextBorder()}; border-radius: 12px; overflow: hidden; background: #fff;">
      <img src="${MEDIA_BASE_URL}${location.image}" alt="Light Show Image"
        style="width: 100%; height: 100%; object-fit: cover; display: block;" />
    </div>
    `
    : "";
  

    const voteBadge = location.is_contestant
    ? `
      <div style="display: flex; justify-content: center;">
        <a href="https://business.cvballiance.org/events/details/deck-the-town-holiday-light-contest-voting-40538" target="_blank" rel="noopener noreferrer"">
          <div style="border-radius: 12px; border: 2px solid ${nextBorder()}; cursor: pointer; overflow: hidden; max-width: 240px; width: 100%; background: #221b16;">
              <svg xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; display: block;" viewBox="0 0 106.68 42.3" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"><defs><style>.prefix__fil0{fill:#221b16}.prefix__fil2{fill: #fabe2a}.prefix__fil1{fill: #fdfdfc}</style></defs><g id="prefix__Layer_x0020_1"><g id="prefix___3077952711056"><path class="prefix__fil0" d="M0 42.355h106.68V.021H0z"/><path class="prefix__fil1" d="M50.63 15.17c0 .08-.007.129-.01.154l-1.2.357c.009.745.171.327.283.83-.36.694.236.656.198 1.158-.313.079-.182.095-.401-.174-.08.276.052.237-.225.402-.348-.25.036.084-.057-1.22l-.236-.078c.114-.56.347-.255.223-.915-.494-.025-.866.022-1.385-.06-.36-.056-.527-.1-.856-.165a.108.108 0 01-.032-.006c-.035-.012-.082-.04-.149-.074l-.292-.1c-.421.807.01.49-.11 1.235l-.29.035c-.082.242-.153.349-.182.593-.041.356.148.329-.185.562-.216-.253-.105-.201-.101-.567-.384.116-.045.178-.508.254.028-.564.815-.574.413-1.273.223-.516.44.007.769-.929-.243-.236-.596-.363-.858-.58-.536-.444-.227-.383-.858-.255-.7.141-1.387-.378-1.545-1.062-.272-1.182.044-4.022-.072-5.473l-1.126-.037c.073-.255 2.924-3.103 3.221-3.198l.025 2.428.98.036-.029.75-.967.027c-.092.927-.028 2.157-.03 3.118-.002 2.114-.175 2.214 1.048 1.921l.195.59-1.107.71c.44.516 1.254.926 1.9 1.1.828.565 2.662.119 3.556-.094zm5.404 1.784c.245.21.017.69-.007 1.04l.356.096.05-.636c.19.274.085.36.362.504.527-.524-.335-.47-.252-1.265l.005-.04c-.162-.526-.442-.13-.501-.97.607-.187 1.164-.49 1.478-1.067l.292.15c.022-.273.008-.202.078-.394.582-.008 1.583-.135 1.792-.73.137-.39.557-1.659.582-1.994-1.093-.077-.708.57-1.81.76-.727.126-1.513-.066-2.047-.564.974-.867 3.454-1.183 3.683-2.622.318-2-2.411-2.627-3.983-2.105-1.696.563-2.381 2.519-2.155 4.216.244 1.825 1.656 2.816 3.406 3.044-.085.986-1.811 1.288-2.663 1.198-.664-.07-2.407-.646-2.578-1.274l.805-.023c.095-.722.083-5.482-.08-6.065-.409-1.473-2.085-1.514-3.072-.998-.327.17-.711.578-.873.638l-.017-4.216c-.78.177-.76.588-2.716.897l-.023.63.615.059c.304.803-.152 7.688.104 9.056l2.011.008c.1-1.28-.024-2.732.016-4.023.027-.876.707-2.695 1.8-2.18.521.528.053 5.107.24 6.195l.737.02c-.155.589-.68.548-1.039.871l-.01.155c-.003.039.006.024.071-.021.715-.346.687-.352 1.22-.872l1.185.908c-.2.793-.385.32-.604.824.2.386-.062.562-.168.944-.4.07-.528.176-.475.582.345.06.243.001.484-.143l.126-.256c.282.378-.044.291.126.75l.343-.014.027-.084c.085-.552-.158-.359-.085-.778.003-.013.122-.387.123-.389.147-.375-.013-.201.273-.269-.007-.62-.362-.554.09-1.105 1.108.401 1.296.314 2.433.373.304.538.117.506.073 1.04.232.019.104-.033.172.139zM12.107 14.763c.362.036.659.183 1.099.21.486.03.877-.032 1.328-.037.202.908-.11.337-.175 1.056.269.1.21.612.233.892-.165.26-.223.255-.27.586l.033.147.364.038c.14-.406-.023-.412.188-.716.338.298.029.412.504.52.533-.567-.88-.708-.245-1.674-.233-.471-.427-.202-.405-.93l1.332-.569c.374.45.325.568.906.993.38.278.984.45 1.278.742-.147.663-.285.297-.489.765.34.564-.412.612-.378 1.06.119.084.115-.025.319.109.202.133-.048.15.283.238.268-.328-.153-1.134.513-1.2-.074-.485-.213-.362-.127-.856.368-.118.901.112 1.326.142.565.04 1.01-.075 1.5-.062.233.97-.1.415-.153 1.253l.274.054c.07.683-.029 1.024.08 1.194.419-.108.071-.143.318-.484.227.282.03.219.36.345.274-.554-.202.036-.287-1.123l.186-.157c-.137-.69-.485-.09-.546-1.111.41-.223.906-.334 1.324-.585.486-.292.647-.58 1.028-.848.8.474.55.58 1.692.922.128 1.03-.228.475-.343 1.098.165.153.096.695.008.891-.16.36-.33.039-.343.7.286.19.01.082.324.106.17-.297.093-.486.334-.642.208.281-.013.588.473.605.251-.443.02-.425-.135-.71-.12-.22-.206-.795.166-.86-.062-.691-.35-.216-.245-1.114.509-.033.948.057 1.506-.026.375-.056.916-.298 1.243-.251.133.583.018.37-.04.866.618.283.105.698.278 1.091.538.065-.013-.194.494-.075.128.03-.102.042.23.086.084-.66-.56-.23-.33-1.4-.32-.37-.422-.085-.492-.697.397-.34.76-.414 1.17-.894l-.036-.112c-1.115.712-1.286 1.068-2.776 1.223-.863.09-2.592-.092-3.008-.987.113-.52.59-1.247-.106-1.614-.995.032-.264 1.197-.2 1.674-.83 1.097-2.614 1.616-3.943 1.48-.997-.103-3.309-.865-3.42-2.04.292-.485.993-.932.487-1.639-.934-.244-.757 1.199-.802 1.622-.721.659-2.933 1.035-3.718.515l-.516-.173c.202-.146 1.773-.3 2.33-.544 2.27-1 2.869-3.663 2.516-5.962-.223-1.455-.978-2.797-2.308-3.462-1.087-.543-4.074-.745-5.208-.49l-.003 10.333c1.487.123 1.765-.248 2.68.313-.06.638-.449.515-.564.735-.148 0-.124-.041-.104.093-.002.933-.796.448-.561 1.246.346-.026.212-.158.471-.387-.002.351-.115.301 0 .608.606-.032.158-.421.504-1.077l.205-.056c.135-.495-.199-.595.389-.987z"/><path class="prefix__fil1" d="M29.762 14.34l.035.11.412-.573c.763.24.875.352 1.732.454-.05 1.001-.378.632-.525 1.193.472.66-.803.976-.089 1.46.336-.229.096-.243.34-.556.035.251.022.474.175.671.483-.112.28-.413.165-.734-.166-.46.104-.58.189-.92-.192-.68-.16-.38.008-1.089l1.329-.076c.249-.12.14-.386.743-.38.307.661.062.453.183 1.038.542-.058.388.602.6.897.3-.118.138-.109.116-.46l.4.209c.047-.531-.672-.294-.439-1.075-.372-.447-.502.004-.76-.76.16-.18.288-.213.46-.397.16-.17.19-.29.38-.463l.468 1.39 2.034.011c0-.412-.686-2.267-.86-2.792-.461-1.398-.38-1.476-1.65-2.16.182-.283.768-.714 1.087-.962.18-.14.389-.303.58-.435.326-.224.525-.209.75-.371l-.019-.536-2.91-.015c-.157.946.074.457.37.787-.106.41-1.1 1.732-1.406 1.838l-.008-6.006c-.775.17-.702.563-2.723.898l-.022.624.615.061c.16.412.17 8.23.032 8.906-.405-.02-.884-.225-1.242-.4-.146-.778.307-1.316.379-2.037-.992-.06-.58.235-1.35.57a2.383 2.383 0 01-1.639.104c-2.329-.65-2.395-4.957-.285-4.378 1.074.294 1.233 1.413 1.712 2.191.297-.055 1.55-.714 1.75-.927-1.004-2.991-5.304-3.048-6.321.173-.769 2.435.66 4.608 2.858 4.915 1.165.163 1.4-.083 2.386-.247l-.04.248zM28.015 22.277c-4.711 1.052-3.392 8.508 1.534 7.63 2.087-.372 3.295-2.59 2.933-4.627-.364-2.052-2.407-3.463-4.467-3.003zM75.66 6.994c-3.768.8-3.038 8.303 1.373 7.309 3.717-.838 3.023-8.243-1.372-7.31zM75.97 25.584c.838.944 1.662 2.174 2.442 3.214.56.747.645 1.206 1.76 1.023.877-.145.574-1.614.574-2.283v-2.794c0-.637.248-2.172-.452-2.4-1.309-.427-1.361.417-1.359 1.383.002.7.08 2.237-.035 2.838-.279-.178-2.003-2.663-2.383-3.154-.54-.697-.625-1.201-1.668-1.118-.92.073-.717.713-.717 2.197v2.794c0 .614-.217 2.262.417 2.496.263.098.956.094 1.186-.083.425-.326.102-2.864.235-4.113zM35.06 25.609c.693.662 1.773 2.305 2.41 3.153.527.704.691 1.208 1.73 1.066.917-.126.63-1.516.63-2.29v-2.794c0-.635.265-2.24-.494-2.417-2.056-.482-1.047 1.645-1.343 4.258-.564-.51-1.876-2.459-2.426-3.202-.517-.7-.665-1.212-1.693-1.085-.952.118-.658 1.497-.658 2.192v2.794c0 .556-.2 2.257.367 2.485.299.12.995.129 1.245-.088.439-.382.022-2.86.233-4.072zM23.801 11.645c-1.211-.021-.66.66-1.968.786-.66.064-1.386-.121-1.867-.573.68-.91 5.007-1.425 3.38-3.856-.887-1.324-3.893-1.744-5.29.425-1.817 2.824.525 6.953 4.413 5.77.78-.237.683-.29.92-1.039.134-.423.41-1.106.412-1.513zM50.052 28.015l-.034-1.038c2.079-.156 2.908.433 2.94-.877.036-1.418-.867-.803-2.906-.964l-.027-1.026c.683-.032 3.392.09 3.76-.106.388-.207.415-1.162.182-1.495-.283-.405-1.266-.238-1.728-.238-4.768.001-4.064-.687-4.064 3.743 0 .606-.145 3.372.229 3.665.23.18 5.203.36 5.524-.03.268-.325.296-1.282-.084-1.515-.384-.236-3.12-.067-3.792-.12z"/><path class="prefix__fil1" d="M91.081 14.447l.182-.15.195.15c.417.37 1.09.667 1.328.897-.094.15-.21.404-.333.513-.247.219-.257.027-.5.356-.013 1.02-.884.476-.664 1.405.477-.01.222-.205.572-.422l-.107.676.458-.06c.039-.723-.127-.503.201-1.164l.224-.035c.149-.762-.182-.449.4-1.22.317.043.629.142.958.171.39.035.735-.03 1.102.013.21.753-.07.44-.11 1.085.598.066.075.68.356 1.059.292-.223.025-.108.237-.424.23.292.016.195.335.248-.013-.469-.552-.52-.159-1.089-.237-.592-.376-.014-.477-.949.428-.12.864-.27 1.028-.475.249-.313.392-.552.463-.732h.017c.215-.413.135-5.559-.004-6.06-.243-.882-.846-1.287-1.787-1.313-1.067-.029-1.46.358-2.16.959l-.035-1.168c-.429.184-.819.432-1.261.606-.442.175-1.083.167-1.46.386l-.016.525.644.125c.292 1.18-.27 5.528.195 5.949-.193.603-1.796.723-2.342.736-.933.022-1.909-.059-2.648-.63l-.061.162c.704.304.89.403 1.665.62-.206.906-.534.677-.66 1.148.426.73-.877.83-.248 1.465.388-.173.144-.242.427-.544.02.334-.077.406.111.67.535-.037.274-.432.224-.746-.099-.613.263-.5.256-.971-.137-.428-.067-.577.151-.984l1.31-.023c.057.546.038.359-.177.76-.004.312.162.31.056.703-.1.375-.253.095-.203.59.255.043.047-.018.199-.012.5.018.045.142.518.192.068-.435-.008-.2-.073-.507-.059-.28-.036-.38-.03-.67l.226-.109c-.107-.622-.464-.224-.273-.976.818-.268.99-.124 1.75-.736zm.569-.09c.087-.027.183-.033.376-.033.253 0 .507.005.761.005.12-1.32-.024-2.804.034-4.148.037-.863.766-2.625 1.807-2.089.421.429.149 5.258.221 6.237l1.578-.024.107.01c-.537 1.606-3.892 1.284-4.884.042zm-5.729.037a.482.482 0 00.074-.064l.28.011c1.702.344 2.482-2.067 2.893-3.312.47-1.42 1.132-4.002-.691-4.707l-1.73.964c.454.535 1.563.79 1.42 2.812-.048.68-.455 2.922-1.023 3.194-.704-.782-1.176-5.06-1.699-6.243l-2.02-.028c.069 1.342 1.07 3.955.917 4.937-.064.414-.316 1.214-.684 1.344-.576-.664-1.16-5.172-1.705-6.257l-1.975-.027c-.012.81.958 4.554 1.255 5.506.26.835.526 1.623 1.5 1.818 1.153.231 1.56-.496 2.131-1.252.084.212.074.47.262.78.173.286.353.326.477.636-.494.919-1.24.884-1.675 1.303-.41-.011-.855.146-1.29.165-.459.02-.931-.02-1.378-.112-.739-.151-1.329-.49-1.8-1.096.112-.486.815-1.494-.129-1.707-.704.35-.208 1.153-.178 1.697-.994.949-1.619.852-2.325 1.144-1.283.068-2.02.087-3.158-.484-.791-.397-1.713-.944-1.907-1.849.288-.472 1.263-1.088.574-1.731-.817-.085-.807 1.062-.822 1.62-.482.302-1.09.541-1.666.474l-.012-9.092c.975.003 2.064 1.13 2.701 1.684l.05-2.626-7.548.001-.014 2.573c.453-.118 1.59-1.62 2.74-1.664.196 2.61-.185 7.11.029 9.463.5.062 1.662.047 2.137-.03.088.694-.05.408-.243.886.126.497.2.698.031 1.23-.274.167-.207.152-.197.499.288.13.078.127.365.038l.04-.166.07.122.03-.52c.441-.138-.024.377.578.51.248-.285.176-.346-.039-.592-.322-.369-.224-.394-.258-.912l.212-.094c-.123-.662-.43-.257-.357-1.09l1.386-.442c.337.405.262.628.817 1.068.405.32.808.535 1.226.821-.16.726-.254.282-.553.771.272.477-.381.626-.503 1.018.262.155.126.144.413-.022.01.46-.104.323.204.452.274-.422-.088-1.224.618-1.171-.042-.48-.22-.47-.013-.951.31.04.826.263 1.242.342.522.099 1.188-.006 1.574.105.046.953-.16.411-.305 1.218l.26.064c.144 1.234-.295.733.006 1.236.424-.166.077-.158.333-.497.2.275.023.265.344.396.299-.48-.35-.325-.154-1.208l.192-.068c-.16-.68-.688-.361-.417-1.254 1.362-.333 1.31-.403 2.403-1.136.338.155.395.379.717.595.288.192.624.303.919.454.098.983-.2.476-.454 1.092.23.302-.005.815-.084.92-.199.263-.583.303-.235.767.567-.06.129-.381.587-.586.185.398-.097.577.42.601.247-.398.07-.375-.073-.685-.14-.3-.042-.495.021-.837l.234-.078c-.105-.638-.345-.3-.16-1.098.494.013.865.128 1.422.097.478-.028.929-.163 1.326-.186.171.729-.028.406-.057 1.004.55.154.018.728.18 1.092.278-.004.173.096.33-.256.22.295.024.268.416.278-.017-.653-.253-.053-.362-1.2l.195-.098c-.261-.532-.575-.197-.475-.947 1.15-.386 1.052-.799 1.748-1.244l.094-.249-.025.066zM67.39 29.896c.588-.536.567-1.159.97-1.637l2.822-.027c.554.69.486 2.109 1.706 1.583 1.222-.527.462-1.32.033-2.213-.756-1.577-1.506-3.172-2.293-4.73-.598-1.186-1.48-.523-1.906.406-.37.809-.785 1.588-1.158 2.398-.373.808-.788 1.586-1.16 2.394-.185.4-.574.916-.299 1.34.235.363.893.54 1.285.486zM56.37 22.279c-1.553.43-3.02 3.333.364 4.408.583.185 1.848.206 1.46 1.129-.29.69-1.255.467-1.714.054-.635-.572-.946-1.022-1.67-.13-.712.877.962 2.371 2.85 2.188 1.586-.154 2.592-1.252 2.41-2.87-.231-2.05-2.24-1.487-3.209-2.112-.728-.47-.132-1.317.795-1.048.673.195.937 1.074 1.737.042 1.132-1.46-1.931-1.964-3.023-1.661z"/><path class="prefix__fil0" d="M11.186 13.466c2.627.46 3.415-2.252 3.448-4.301.018-1.074-.111-2.274-.67-3.211-.508-.851-1.813-1.534-2.773-1.194-.095.454-.1 8.282-.005 8.706z"/><path class="prefix__fil1" d="M21.47 22.251c-2.923.454-4.36 3.392-2.806 5.926.614 1.003 2.053 1.749 3.264 1.767a3.95 3.95 0 001.962-.529c.742-.45.893-.729.295-1.508-.883-1.15-1.71 1.202-3.556-.255-1.086-.857-.978-2.606.215-3.314 1.998-1.186 2.587 1.344 3.572-.413.726-1.294-2.054-1.813-2.947-1.674zM60.106 23.57c.484.39 1.924.127 2.58.213.123.588.019 4.022.031 5.113.008.702.119.937.867.948 1.187.018.933-.667.933-2.56 0-.703-.088-2.99.042-3.505 1.286-.143 3.054.503 2.642-1.126-.113-.443-.523-.386-.904-.385l-5.083.002c-.924-.005-1.615.15-1.108 1.3zM40.503 23.607c.53.312 1.882.098 2.55.172.128.511.022 4.076.04 5.118.011.707.092.93.848.947 1.208.027.95-.584.95-2.56 0-.787-.098-2.868.033-3.5.64-.085 2.117.175 2.568-.227.14-.28.187-.747.029-1.036-.18-.329-.713-.254-1.038-.251h-4.997c-.334-.003-.85-.078-1.031.253-.17.31-.098.786.048 1.083zM84.014 23.788c.114.733.007 3.92.02 5.108.009.714.125.946.886.95 1.166.004.906-.736.906-2.562 0-.644-.086-3.075.058-3.505.725-.076 1.78.105 2.44-.112.234-.273.34-.925.089-1.225-.283-.339-4.225-.17-4.762-.17-1.02 0-2.47-.402-2.332.926.104 1 1.283.37 2.695.59z"/><path class="prefix__fil0" d="M92.787 14.33l-1.182-.031c.932 1.29 4.384 1.647 4.93.016l-1.686.014c-.072-.98.2-5.808-.221-6.237-1.041-.536-1.77 1.226-1.808 2.09-.057 1.343.087 2.827-.033 4.147zM28.536 24.034c-2.611.502-1.885 4.553.65 4.069 1.097-.21 1.677-1.32 1.517-2.407-.147-.998-1.099-1.867-2.167-1.662zM75.539 7.901c-1.357.97.348 6.421 1.662 5.487 1.277-.906-.404-6.386-1.662-5.487z"/><path class="prefix__fil1" d="M62.579 35.3c-1.99.52-1.447 4.04.842 3.517 1.967-.45 1.502-4.13-.842-3.517zM72.257 35.313c-1.965.53-1.39 4.158.97 3.476 1.858-.536 1.377-4.108-.97-3.476zM43.391 38.755l.612.046.029-2.251 2.483-.012.023 2.237.606.021.026-4.8-.602-.021-.04 1.97-2.457.017-.049-1.967-.616-.004zM57.043 37.734l-.491-.058c-.399.434-.424.849-1.235.668-.527-.117-.73-.643-.763-1.129l2.574-.029c.093-2.481-2.835-2.541-3.163-.56-.483 2.915 3.147 2.663 3.078 1.108zM79.824 37.732l-.497-.056c-.393.428-.37.811-1.161.681-.567-.093-.833-.638-.81-1.152l2.547-.018c.128-2.433-2.829-2.601-3.156-.542-.468 2.946 3.172 2.59 3.077 1.087zM51.098 37.748l-.546-.063c-.326.47-.44.8-1.168.669-.563-.102-.79-.638-.791-1.15l2.547-.015c.226-2.386-2.86-2.639-3.15-.509-.392 2.875 3.021 2.57 3.108 1.068zM30.985 37.267l-.552-.149c-.447.717-.523 1.378-1.728 1.18-.84-.137-1.21-.91-1.257-1.702-.127-2.109 2.02-3.072 2.867-1.184l.578-.088c-.062-1.9-4.312-2.199-4.104 1.19.2 3.278 3.94 2.827 4.196.753z"/><path class="prefix__fil0" d="M55.88 11.114c.88-.257 3.322-2.306 1.528-3.132-1.961-.902-2.387 1.908-1.529 3.132zM19.383 11.1c.679-.07 3.297-2.124 1.719-3.052-.747-.44-1.649-.2-1.964.606-.284.726-.09 1.772.245 2.446z"/><path class="prefix__fil1" d="M68.641 38.788l.616.009 1.916-4.784-.639-.044-1.555 4.222-1.501-4.204-.664-.011zM38.078 38.775l.578.013c.07-.685-.228-1.426.437-1.72.2.216.537.766.71 1.04.41.645.283.778 1.13.664l-1.416-2.14 1.254-1.286c-1.183-.214-1.25.77-2.068 1.295l-.034-2.635-.548-.03-.043 4.799z"/><path class="prefix__fil0" d="M72.338 35.833c-1.21.55-.66 3.148.808 2.455 1.035-.49.708-3.143-.808-2.455zM62.64 35.801c-1.132.444-.805 2.999.718 2.517 1.154-.365.81-3.115-.717-2.517z"/><path class="prefix__fil1" d="M37.52 37.617l-.513-.087c-.239.55-.316.955-1.091.832-.987-.156-1.013-2.162-.202-2.543.826-.388.966.25 1.291.596l.484-.087c-.273-1.593-2.954-1.572-2.943.778.01 2.357 2.948 2.177 2.975.51zM75.133 35.245c-.272.102-.475-.018-.422.323.057.376.112.084.426.272.05 2.406-.343 3.144 1.258 2.95l-.04-.418c-.496-.335-.634.234-.624-.926.005-.538-.007-1.077.012-1.614l.586-.094-.001-.378-.589-.084-.004-1.103c-.677.027-.583.525-.602 1.072zM59.87 34.41l-.04.832c-.394.205-.35-.16-.415.265-.069.451.09.16.417.33.057 2.307-.372 3.156 1.247 2.953-.056-1.581-.79 1.284-.65-2.958.33-.127.338.042.588-.164l-.003-.258c-.247-.206-.256-.038-.586-.165l-.008-1.082-.55.248z"/><path class="prefix__fil0" d="M33.661 13.871c.459-.01 1.093-.591 1.323-.965.412-.667-.284-1.2-.45-1.613-.123-.301.007-.76-.567-.617-.38.095-.32.524-.317.855.008.771-.023 1.576.011 2.34z"/><path class="prefix__fil1" d="M31.718 38.799l.588-.017.006-.322-.001-4.149-.001-.303-.592-.043zM52.474 35.762c-.199-.432.134-.493-.58-.44l-.015 3.466h.587c.082-2.357-.345-3.023 1.125-2.87l.17-.493c-.616-.313-.957-.24-1.287.337z"/><path class="prefix__fil2" d="M76.53 17.423l-.26-.064c-.245.673-.27.984.103 1.62.2.343.632.869 1.001.992.458-.516.423-2.152-.123-2.69l-.192.07c-.195.883.453.727.154 1.207-.321-.13-.144-.12-.344-.396-.256.339.09.332-.333.497-.301-.503.138-.002-.005-1.236zM21.07 17.47c-.167.635-.21.94.177 1.522.265.399.737.925 1.194.934.274-.772.242-2.091-.439-2.627l-.186.157c.085 1.16.561.569.286 1.123-.329-.126-.132-.063-.359-.345-.247.34.1.376-.317.484-.11-.17-.01-.51-.08-1.194l-.275-.054zM46.38 16.514l-.29.035c-.081.242-.152.349-.18.592-.042.357.147.33-.186.563-.216-.253-.105-.201-.101-.567-.384.116-.045.178-.508.254.028-.564.815-.574.413-1.273-.758.503-1.124 1.55-.993 2.438.509.085 1.002-.252 1.35-.59.442-.43.544-.815.496-1.452zM81.29 17.135l-.235.078c-.064.342-.16.537-.021.837.144.31.32.287.074.685-.518-.024-.236-.203-.42-.601-.46.205-.02.527-.588.586-.348-.464.036-.504.235-.767.08-.105.314-.618.084-.92-.786.619-.658 2.576.276 2.702.352-.17.539-.727.664-1.089.216-.622.103-.92-.07-1.51zM73.772 16.645c-.706-.053-.344.75-.618 1.171-.308-.129-.194.009-.204-.452-.287.166-.151.177-.413.022.122-.392.775-.541.503-1.018-.837.268-.96 1.67-.707 2.425.738.048 1.558-1.289 1.439-2.148zM83.82 16.952c-.46.675.314 2.317.91 2.342.427-.516.513-2.09-.15-2.526l-.196.098c.109 1.147.345.547.362 1.2-.392-.01-.196.017-.416-.278-.157.352-.052.252-.33.256-.162-.364.37-.938-.18-1.092zM28.448 16.34c-.339 1.291.776 2.318 1.156 2.267.234-.391.225-1.03.166-1.476-.076-.57-.264-.74-.65-1.088-.23 1.169.414.739.33 1.399-.332-.044-.102-.056-.23-.086-.507-.119.044.14-.494.075-.173-.393.34-.808-.278-1.091zM18.525 16.992c-.666.067-.245.873-.513 1.2-.331-.088-.081-.104-.283-.237-.203-.134-.2-.025-.32-.11-.033-.447.718-.495.38-1.059-.776.418-.838 1.923-.434 2.466.694-.117 1.507-1.617 1.17-2.26zM89.604 16.16l-.227.108c-.004.29-.028.39.031.67.065.308.141.072.073.507-.473-.05-.017-.174-.518-.192-.152-.005.056.055-.199.012-.05-.495.102-.215.203-.59.106-.393-.06-.391-.055-.703-.32.426-.472.816-.365 1.406.072.394.265 1.075.611 1.253.575-.256.958-1.979.446-2.472zM48.982 16.6c-.428.616-.035 2.196.635 2.421.323-.233.45-.823.505-1.226.085-.622-.02-.867-.419-1.284-.36.694.236.656.198 1.158-.313.079-.182.095-.401-.174-.08.276.052.237-.225.402-.348-.25.036.084-.057-1.22l-.236-.078z"/><path class="prefix__fil1" d="M33.229 38.757l.562.046.023-3.478-.537-.011z"/><path class="prefix__fil2" d="M94.987 16.662c-.272.865.447 1.995 1.189 2.055.231-.721.168-1.755-.42-2.26-.393.568.146.62.16 1.087-.32-.052-.106.045-.336-.247-.212.316.055.2-.237.424-.281-.378.242-.993-.356-1.06zM34.459 14.938c.073.909.885 1.711 1.766 1.6.014-.82-.366-1.642-1.088-2.03-.234.782.485.545.439 1.076l-.401-.209c.022.351.185.342-.115.46-.213-.295-.06-.955-.601-.897zM52.928 18.027l-.343.015c-.17-.46.156-.373-.126-.75l-.126.255c-.24.144-.139.204-.484.143-.053-.405.074-.511.475-.582.106-.382.368-.558.168-.944-.755.442-1.124 1.723-.821 2.54.49.114 1.075-.253 1.257-.677zM70.028 16.327l-.14.565c-.288.09-.077.092-.365-.038.075.484.495.994 1.008.97.478-.671.563-1.926-.01-2.584l-.212.094c.034.518-.065.543.258.912.215.246.287.307.039.591-.602-.132-.137-.647-.578-.51zM14.355 17.617c.18.43.61.915 1.109.832.485-.879.266-1.925-.298-2.664-.636.965.778 1.107.245 1.674-.475-.108-.166-.222-.504-.52-.21.304-.049.31-.188.716l-.364-.038zM24.822 18.367c.041.487.327 1 .84 1.056.598-.523.78-1.858.322-2.558-.372.065-.286.64-.166.86.155.285.386.267.135.71-.486-.017-.265-.324-.473-.605-.24.156-.163.344-.335.642-.314-.024-.037.083-.323-.105z"/><path class="prefix__fil0" d="M48.623 36.671c.452.124 1.42.107 1.896.017-.118-1.375-1.764-1.22-1.895-.017z"/><path class="prefix__fil2" d="M86.858 16.345c-.649.325-.69 1.693-.25 2.22 1.044.157 1.309-1.657 1.019-2.346.007.472-.355.358-.256.97.05.315.312.71-.224.747-.188-.264-.091-.336-.111-.67-.283.303-.04.371-.427.544-.629-.634.674-.736.249-1.465z"/><path class="prefix__fil0" d="M54.61 36.698l1.867.024c-.048-1.348-1.798-1.336-1.867-.024zM77.39 36.698l1.87.024c-.044-1.317-1.79-1.352-1.87-.024z"/><path class="prefix__fil2" d="M31.416 15.524c-.6.452-.546 1.75-.018 2.237 1.027-.055 1.024-1.592.798-2.316-.085.34-.355.46-.19.92.116.32.319.622-.164.734-.152-.197-.14-.42-.174-.671-.245.313-.005.327-.34.556-.715-.484.56-.8.088-1.46zM11.718 15.75l-.205.056c-.346.656.102 1.045-.503 1.077-.116-.307-.003-.257 0-.608-.26.229-.126.36-.472.387-.235-.798.559-.313.56-1.246-.63.279-.99 1.283-.648 1.929.805.214 1.274-.924 1.268-1.595zM92.212 17.812l-.458.06.107-.676c-.35.217-.095.412-.572.422-.22-.929.65-.385.663-1.405-.704.338-1.099 1.37-.788 2.116.446.287.912-.121 1.048-.517z"/><path class="prefix__fil0" d="M69.107 26.67l1.315.048-.624-1.374z"/><path class="prefix__fil2" d="M56.027 17.995c.074.416.31.713.757.619.41-.458.367-1.746-.236-1.96-.116.837.782.772.247 1.304-.277-.143-.171-.23-.361-.504l-.051.636-.356-.095z"/><path class="prefix__fil0" d="M71.711 13.233c.396-.149.866-.767.554-1.22-.51.022-.602.769-.554 1.22zM16.192 13.815c.436-.187.666-.722.525-1.216-.57-.064-.595.775-.525 1.215z"/><path class="prefix__fil2" d="M69.523 16.854c-.01-.347-.077-.332.197-.498.168-.533.095-.734-.031-1.23-.297.483-.543 1.221-.166 1.728zM24.822 18.367c.013-.662.183-.342.343-.7.088-.197.156-.739-.008-.892-.377.308-.662 1.2-.335 1.592zM14.322 17.47c.047-.331.105-.326.27-.586-.023-.28.036-.792-.233-.892-.275.453-.362 1.052-.037 1.478zM52.955 17.943c.43-.296.433-.946.311-1.436-.286.068-.126-.106-.273.269-.001.002-.12.376-.123.39-.073.418.17.225.085.777z"/><path class="prefix__fil0" d="M23.813 14.387c.284-.306.409-.988-.011-1.256-.435.243-.201.902.011 1.256zM79.34 14.46c.292-.318.473-.92.063-1.222-.464.181-.267.907-.063 1.223z"/><path class="prefix__fil1" d="M33.231 34.617l.559.059.022-.689-.578.006z"/><path class="prefix__fil2" d="M92.212 17.812c.32-.248.432-.785.425-1.199l-.224.035c-.328.662-.162.441-.201 1.164zM56.027 17.995c.024-.35.252-.83.007-1.041-.068-.172.06-.12-.172-.138-.058.419-.082.86.165 1.179zM52.58 17.14c.22-.123.147-.031.238-.379.05-.195.074-.22.016-.37-.133.164-.319.546-.253.75zM45.717 16.997c.162-.2.284-.387.172-.615-.168.18-.273.368-.172.615z"/></g></g></svg>
          </div>
        </a>
      </div>`
    : "";
  

    const buttonRowHtml = `
    <div style="display: flex; gap: 0.5rem; justify-content: center; padding: 0.5rem;">
      <a id="share-light-show"
        style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background-color: #b30000;
          color: white;
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
          font-weight: bold;
          text-decoration: none;
        ">
        Share This Display
      </a>
      <a id="get-directions" href="${directionsUrl}" target="_blank"
        style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background-color: #006400;
          color: white;
          border-radius: 12px;
          text-align: center;
          font-weight: bold;
          text-decoration: none;
          cursor: pointer;
        ">
        Get Directions
      </a>
    </div>
  `;
  
  const MUSIC_NOTE_ICON = "https://webstockreview.net/images/clipart-music-muzik-17.png";

  return `
  <div class="iw-container">
  <div class="iw-header" style="
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #b30000;
    color: white;
    font-weight: bold;
    padding: 12px 16px;
    gap: 8px;
    flex-wrap: nowrap;
  ">
    <div style="
      font-size: 1.3rem;
      letter-spacing: 0.04em;
      line-height: 1.2;
      flex: 1 1 auto;
      word-wrap: break-word;
      padding-right: 8px;
    ">
      ${cleanedTitle}
    </div>

    <div style="
      position: relative;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${
        isAnimated
          ? `<div style="
              position: absolute;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: repeating-conic-gradient(
                red 0deg 20deg,
                green 20deg 40deg,
                white 40deg 60deg
              );
              animation: rotate-halo 18s linear infinite;
              z-index: 0;
            "></div>`
          : ""
      }

      <div style="
        width: 32px;
        height: 32px;
        background-color: #e0e0e0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 4px solid ${isAnimated ? 'none' : 'red'};
        z-index: 1;
        position: relative;
      ">
        <img 
          src="${MUSIC_NOTE_ICON}" 
          alt="Musical Notes" 
          style="width: 16px; height: 16px;" 
        />
        ${
          !isAnimated
            ? `<div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 32px;
                  height: 32px;
                  pointer-events: none;
                ">
                <div style="
                  position: absolute;
                  width: 2px;
                  height: 32px;
                  background-color: red;
                  transform: rotate(45deg);
                  top: 0;
                  left: 15px;
                  transform-origin: center;
                "></div>
                <div style="
                  position: absolute;
                  width: 2px;
                  height: 32px;
                  background-color: red;
                  transform: rotate(-45deg);
                  top: 0;
                  left: 15px;
                  transform-origin: center;
                "></div>
              </div>`
            : ""
        }
      </div>
    </div>
  </div>


    
    <div class="iw-body" style="padding: 1rem; background: #f0f0f0; font-weight: bold;">
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${formattedAddressHtml}
        ${formattedDescriptionHtml}
        ${imageHtml}
        ${voteBadge}
        ${buttonRowHtml}
      </div>
    </div>
  </div>
`;

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
            green 20deg 40deg,
            white 40deg 60deg
          )
        `;
        
        

        halo.style.animation = "rotate-halo 18s linear infinite";
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
        setIsBannerHidden(true);
        setMenuOpen(m => false)
        const infoContent = buildInfoWindowContent(location);
        infoWindowInstance.setContent(infoContent);
        infoWindowInstance.open(mapInstance, marker);

        logEvent(analytics, "light_show_clicked", {
          location_name: cleanedTitle,
          is_animated: location.is_animated,
        });
        

      
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
                  .then(() => {
                    console.log('Shared successfully!');
                    logEvent(analytics, "light_show_shared", {
                      light_show_id: location.id,
                      title: cleanedTitle,
                      is_animated: location.is_animated,
                    });
                  })
                  .catch((error) => console.error('Sharing failed:', error));
              } else {
                alert("Sharing isn't supported on this browser.");
              }
            });
          }
        });
        const directionsButton = document.getElementById('get-directions');
        if (directionsButton) {
          directionsButton.addEventListener('click', () => {
            logEvent(analytics, "get_directions_clicked", {
              light_show_id: location.id,
              title: cleanedTitle,
              is_animated: location.is_animated,
            });
          });
        }
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
  
      const infoContent = buildInfoWindowContent(sharedLocation);

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



      window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        const shareButton = document.getElementById('share-light-show');
        if (shareButton) {
          shareButton.addEventListener('click', () => {
            const shareUrl = `${window.location.origin}${window.location.pathname}?locationId=${sharedLocation.id}`;
            const shareData = {
              title: `🎄 ${cleanTitle(sharedLocation.name)}`,
              text: `Check out this awesome light show! 🎄 ${cleanTitle(sharedLocation.name)}`,
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
