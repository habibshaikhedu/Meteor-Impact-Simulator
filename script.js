const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "",
}).addTo(map);

let impactMarker = null;
let circles = [];

// Handle map click
map.on("click", (e) => {
  if (impactMarker) map.removeLayer(impactMarker);
  impactMarker = L.marker(e.latlng).addTo(map);
});

// Simulate button
document.getElementById("simulate").addEventListener("click", () => {
  if (!impactMarker) {
    alert("Click on the map to place impact point!");
    return;
  }
  const diameter = parseFloat(document.getElementById("diameter").value);
  const speed = parseFloat(document.getElementById("speed").value) * 1000; // km/s -> m/s
  const density = 3000; // kg/m³
  const radius = diameter / 2;

  const mass = (4 / 3) * Math.PI * Math.pow(radius, 3) * density;
  const energy = 0.5 * mass * Math.pow(speed, 2);
  const baseRadius = Math.pow(energy, 0.25) / 100; // km

  const zones = [
    { color: "red", scale: 0.3 },
    { color: "orange", scale: 0.6 },
    { color: "green", scale: 1.0 },
  ];

  // Remove old circles
  circles.forEach((c) => map.removeLayer(c));
  circles = [];

  // Draw new circles
  zones.forEach((z) => {
    const circle = L.circle(impactMarker.getLatLng(), {
      radius: baseRadius * z.scale * 1000, // km -> m
      color: z.color,
      fillColor: z.color,
      fillOpacity: 0.3,
    }).addTo(map);
    circles.push(circle);
  });

  document.getElementById("result").innerHTML =
    `Estimated Energy: ${(energy / 4.184e15).toFixed(2)} megatons TNT<br>` +
    `Low Damage Radius: ${baseRadius.toFixed(2)} km`;

  });


document.getElementById("reset").addEventListener("click", () => {
  if (impactMarker) map.removeLayer(impactMarker);
  circles.forEach((c) => map.removeLayer(c));
  circles = [];
  impactMarker = null;
  document.getElementById("result").innerHTML = "";
});

// === Load NASA Asteroids ===
const asteroidSelect = document.getElementById("asteroidSelect");
const NASA_API_KEY = "X9DSaBnFMphqcbM7sAa8NiYLHMx9Pmutawt8h2jQ"; // replace with your key if you have one

async function loadAsteroids() {
  try {
    const res = await fetch(
      `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${NASA_API_KEY}`
    );
    const data = await res.json();
    asteroidSelect.innerHTML = "<option value=''>Select Asteroid</option>";

    // Add top 20 asteroids
    data.near_earth_objects.slice(0, 20).forEach((obj) => {
      const name = obj.name;
      const dia =
        (obj.estimated_diameter.meters.estimated_diameter_min +
          obj.estimated_diameter.meters.estimated_diameter_max) /
        2;
      const speed = parseFloat(
        obj.close_approach_data[0]?.relative_velocity.kilometers_per_second ||
          15
      );

      asteroidSelect.innerHTML += `<option value="${dia},${speed}">${name}</option>`;
    });
  } catch (err) {
    asteroidSelect.innerHTML = "<option>Error loading asteroids</option>";
  }
}

asteroidSelect.addEventListener("change", (e) => {
  if (!e.target.value) return;
  const [dia, speed] = e.target.value.split(",");
  document.getElementById("diameter").value = parseFloat(dia).toFixed(1);
  document.getElementById("speed").value = parseFloat(speed).toFixed(2);
});

loadAsteroids();
window.addEventListener("DOMContentLoaded", () => {
  const infoBtn = document.getElementById("infoBtn");
  const infoModal = document.getElementById("infoModal");
  const closeInfo = document.getElementById("closeInfo");

  infoBtn.addEventListener("click", () => {
    infoModal.classList.remove("hidden");
  });

  closeInfo.addEventListener("click", () => {
    infoModal.classList.add("hidden");
  });
});

