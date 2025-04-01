// static/admin/js/maps_autofill.js
document.addEventListener("DOMContentLoaded", function () {
    const urlField = document.querySelector("#id_google_maps_url");
  
    if (!urlField) return;
  
    urlField.addEventListener("change", function () {
      const url = urlField.value;
  
      const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const addressMatch = url.match(/\/place\/(.*?)\/@/);
  
      if (coordsMatch) {
        const latitude = parseFloat(coordsMatch[1]);
        const longitude = parseFloat(coordsMatch[2]);
  
        const latField = document.querySelector("#id_latitude");
        const lonField = document.querySelector("#id_longitude");
  
        if (latField) latField.value = latitude;
        if (lonField) lonField.value = longitude;
      }
  
      if (addressMatch) {
        const rawAddress = addressMatch[1].replace(/\+/g, " ").trim();
        const addressField = document.querySelector("#id_address");
        if (addressField) addressField.value = rawAddress;
      }
    });
  });
  