import { fetchData } from "./api.js";
import { renderImages } from "./render.js";

let map;
let currentItem = null;

/** Lấy id từ URL */
function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

/** Lấy vị trí user */
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject("No GPS");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }),
      reject,
      { enableHighAccuracy: true }
    );
  });
}

/** Gọi OSRM */
async function getRoute(from, to) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || !data.routes.length) {
    throw new Error("No route");
  }

  return data.routes[0].geometry;
}

/** Vẽ route */
function drawRoute(geometry) {
  const geojson = { type: "Feature", geometry };

  if (map.getSource("route")) {
    map.getSource("route").setData(geojson);
    return;
  }

  map.addSource("route", { type: "geojson", data: geojson });

  map.addLayer({
    id: "route-line",
    type: "line",
    source: "route",
    paint: {
      "line-color": "#2563eb",
      "line-width": 5
    }
  });
}

/** MAIN */
document.addEventListener("DOMContentLoaded", async () => {
  const id = getIdFromUrl();
  if (!id) return;

  await fetchData(5); // fetch nhiều page cho chắc

  const item = (window.rawData || []).find(
    (x) => String(x.id) === String(id)
  );
  if (!item) {
    alert("Không tìm thấy dữ liệu mặt bằng");
    return;
  }

  currentItem = item;

  renderImages(item);

  document.getElementById("title").textContent = item.title || "";
  document.getElementById("location").textContent =
    [item.street, item.ward, item.district, item.region].filter(Boolean).join(", ");
  document.getElementById("price").textContent = item.price_string || "Liên hệ";
  document.getElementById("area").textContent =
    item.area_m2 ? `${item.area_m2} m²` : "—";

  map = new maplibregl.Map({
    container: "vietmap",
    style: "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    center: [item.lng, item.lat],
    zoom: 15
  });

  new maplibregl.Marker({ color: "#2563eb" })
    .setLngLat([item.lng, item.lat])
    .addTo(map);

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  // enable nút
  const btn = document.getElementById("btnRoute");
  btn.disabled = false;
  btn.classList.remove("opacity-50");
});

/** BUTTON */
window.routeToListing = async function () {
  try {
    if (!map || !currentItem) {
      alert("Map chưa sẵn sàng");
      return;
    }

    const pos = await getUserLocation();

    new maplibregl.Marker({ color: "#16a34a" })
      .setLngLat([pos.lng, pos.lat])
      .addTo(map);

    const geometry = await getRoute(
      { lat: pos.lat, lng: pos.lng },
      { lat: currentItem.lat, lng: currentItem.lng }
    );

    drawRoute(geometry);
  } catch (e) {
    console.error(e);
    alert("Không lấy được vị trí hoặc không tìm được đường");
  }
};
