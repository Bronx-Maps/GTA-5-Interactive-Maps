const center_x = 117.3;
const center_y = 172.8;
const scale_x = 0.02072;
const scale_y = 0.0205;

const CUSTOM_CRS = L.extend({}, L.CRS.Simple, {
  projection: L.Projection.LonLat,
  scale: function (zoom) { return Math.pow(2, zoom); },
  zoom: function (scale) { return Math.log(scale) / Math.LN2; },
  distance: function (latlng1, latlng2) {
    var dx = latlng2.lng - latlng1.lng, dy = latlng2.lat - latlng1.lat;
    return Math.sqrt(dx * dx + dy * dy);
  },
  transformation: new L.Transformation(scale_x, center_x, -scale_y, center_y),
  infinite: true
});

const DEFAULT_POINT = { x: 78.8508, y: 112.5588 };
const DEFAULT_HEADING = 161.7077;

const DISTRICTS = [
  { name: "LEGION SQUARE", region: "DOWNTOWN", x: 78.8508, y: 112.5588 },
  { name: "PILLBOX HILL", region: "CENTRO", x: 255, y: 185 },
  { name: "MISSION ROW", region: "CENTRO", x: 280, y: 100 },
  { name: "BANCO DE LOS SANTOS", region: "CENTRO", x: -40, y: 185 },
  { name: "MAZE BANK ARENA", region: "SUL", x: -290, y: -150 },
  { name: "LOS SANTOS CITY HALL", region: "CENTRO", x: -165, y: 80 },
  { name: "LITTLE SEOUL", region: "OESTE", x: -360, y: -305 }
];

const ROADS = [
  { name: "Del Perro Freeway", x: -1150, y: 240, angle: -12 },
  { name: "San Andreas Avenue", x: -200, y: -90, angle: -19 },
  { name: "Morningwood Blvd", x: -1300, y: -20, angle: -12 },
  { name: "Alta Street", x: -140, y: 280, angle: 72 },
  { name: "Strawberry Avenue", x: 100, y: 50, angle: 70 },
  { name: "Vespucci Boulevard", x: 300, y: -160, angle: -20 },
  { name: "Olympic Freeway", x: 600, y: -750, angle: -15 },
  { name: "Los Santos Freeway", x: 1200, y: 2200, angle: -65 },
  { name: "Great Ocean Highway", x: -3200, y: 3500, angle: 75 },
  { name: "Senora Freeway", x: 2146, y: 4971, angle: -78 },
  { name: "Route 68", x: 400, y: 3500, angle: -15 }
];

const map = L.map("map", {
  crs: CUSTOM_CRS,
  minZoom: 1,
  maxZoom: 7,
  zoomControl: true,
  attributionControl: false,
  zoomSnap: 0.1,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 100,
  center: [DEFAULT_POINT.y, DEFAULT_POINT.x],
  zoom: 3
});

L.tileLayer('https://gtamap.xyz/mapStyles/styleSatelite/{z}/{x}/{y}.jpg', {
  minZoom: 1,
  maxZoom: 7,
  maxNativeZoom: 5,
  noWrap: true,
  updateWhenZooming: false,
  keepBuffer: 4,
  bounds: [[-4000, -4000], [8000, 4500]]
}).addTo(map);

let marker;

const xInput = document.getElementById("x-input");
const yInput = document.getElementById("y-input");
const goBtn = document.getElementById("go-btn");
const resetBtn = document.getElementById("reset-btn");

const infoX = document.getElementById("info-x");
const infoY = document.getElementById("info-y");
const infoZoom = document.getElementById("info-zoom");
const infoHeading = document.getElementById("info-heading");

function getNearestDistrict(x, y) {
  let best = DISTRICTS[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  DISTRICTS.forEach((district) => {
    const dx = district.x - x;
    const dy = district.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < bestDistance) {
      best = district;
      bestDistance = distance;
    }
  });

  return best;
}

function updatePanels(x, y) {
  const px = x.toFixed(4);
  const py = y.toFixed(4);

  infoX.textContent = px;
  infoY.textContent = py;
  xInput.value = px;
  yInput.value = py;
  infoZoom.textContent = map.getZoom().toFixed(2);
  infoHeading.textContent = DEFAULT_HEADING.toFixed(4);
}

function createPin() {
  const icon = L.divIcon({
    className: "pin-wrapper",
    html: `<div class="custom-pin"></div>`,
    iconSize: [42, 62],
    iconAnchor: [21, 52]
  });

  marker = L.marker([DEFAULT_POINT.y, DEFAULT_POINT.x], {
    draggable: true,
    icon
  }).addTo(map);

  marker.on("drag", () => {
    const latlng = marker.getLatLng();
    updatePanels(latlng.lng, latlng.lat);
  });

  marker.on("dragend", () => {
    const latlng = marker.getLatLng();
    updatePanels(latlng.lng, latlng.lat);
  });
}

function goToPoint(x, y, shouldFly = true) {
  const latlng = [y, x];
  marker.setLatLng(latlng);
  if (shouldFly) {
    map.flyTo(latlng, Math.max(map.getZoom(), 3), { duration: 0.8 });
  } else {
    map.panTo(latlng);
  }
  updatePanels(x, y);
}

goBtn.addEventListener("click", () => {
  const xStr = xInput.value.replace(',', '.');
  const yStr = yInput.value.replace(',', '.');
  const x = Number.parseFloat(xStr);
  const y = Number.parseFloat(yStr);
  if (Number.isNaN(x) || Number.isNaN(y)) {
    return;
  }
  goToPoint(x, y);
});

resetBtn.addEventListener("click", () => {
  goToPoint(DEFAULT_POINT.x, DEFAULT_POINT.y, false);
  map.setZoom(3);
});

map.on("click", (event) => {
  marker.setLatLng(event.latlng);
  updatePanels(event.latlng.lng, event.latlng.lat);
});

map.on("zoomend", () => {
  const latlng = marker.getLatLng();
  updatePanels(latlng.lng, latlng.lat);
});

createPin();
goToPoint(DEFAULT_POINT.x, DEFAULT_POINT.y, false);
map.setZoom(3);
