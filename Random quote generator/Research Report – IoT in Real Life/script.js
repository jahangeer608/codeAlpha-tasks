// ============ DATA ============
const devices = [
  { id: 1, name: "Living Room Lamp", room: "living", icon: "💡", on: true, meta: "Warm white · 70%" },
  { id: 2, name: "Ceiling Fan", room: "living", icon: "🌀", on: false, meta: "Speed 0" },
  { id: 3, name: "Smart TV", room: "living", icon: "📺", on: true, meta: "Streaming" },
  { id: 4, name: "Kitchen Lights", room: "kitchen", icon: "💡", on: true, meta: "Bright · 100%" },
  { id: 5, name: "Refrigerator", room: "kitchen", icon: "🧊", on: true, meta: "3.5°C" },
  { id: 6, name: "Coffee Maker", room: "kitchen", icon: "☕", on: false, meta: "Idle" },
  { id: 7, name: "Bedroom Lamp", room: "bedroom", icon: "💡", on: false, meta: "Off" },
  { id: 8, name: "Air Purifier", room: "bedroom", icon: "🌬️", on: true, meta: "AQI good" },
  { id: 9, name: "Smart Blinds", room: "bedroom", icon: "🪟", on: false, meta: "60% closed" },
  { id: 10, name: "Front Door Lock", room: "security", icon: "🔒", on: true, meta: "Locked" },
  { id: 11, name: "Motion Sensor", room: "security", icon: "🛰️", on: true, meta: "Monitoring" },
  { id: 12, name: "Garage Camera", room: "security", icon: "🎥", on: true, meta: "Recording" },
];

const quickIds = [1, 4, 10, 8, 3, 11]; // devices featured on the Home tab

let energyHistory = [1.2, 1.4, 1.3, 1.6, 1.8, 1.5, 1.9];
let energyLabels = ["-18s", "-15s", "-12s", "-9s", "-6s", "-3s", "now"];
let currentRoom = "all";
let armed = true;

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ============ TAB NAVIGATION ============
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("page-" + btn.dataset.page).classList.add("active");
    document.querySelector(".pages").scrollTop = 0;
  });
});

// ============ RENDER: DEVICES PAGE ============
const grid = document.getElementById("deviceGrid");

function renderDevices(filterText = "") {
  grid.innerHTML = "";
  const list = devices.filter(d => {
    const roomMatch = currentRoom === "all" || d.room === currentRoom;
    const textMatch = d.name.toLowerCase().includes(filterText.toLowerCase());
    return roomMatch && textMatch;
  });

  if (list.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1; color:#8a6b78; font-size:12.5px;">No devices match your search.</p>`;
    return;
  }

  list.forEach(d => grid.appendChild(buildDeviceCard(d)));
  bindToggles(grid);
}

function buildDeviceCard(d) {
  const card = document.createElement("div");
  card.className = "device-card" + (d.on ? " on" : "");
  card.innerHTML = `
    <div class="device-top">
      <span class="device-icon">${d.icon}</span>
      <label class="switch">
        <input type="checkbox" data-id="${d.id}" ${d.on ? "checked" : ""} aria-label="Toggle ${d.name}">
        <span class="slider-toggle"></span>
      </label>
    </div>
    <p class="device-name">${d.name}</p>
    <p class="device-room">${capitalize(d.room)}</p>
    <p class="device-meta">${d.on ? d.meta : "Standby"}</p>
  `;
  return card;
}

function bindToggles(container) {
  container.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", (e) => {
      const id = Number(e.target.dataset.id);
      const dev = devices.find(x => x.id === id);
      dev.on = e.target.checked;
      logActivity(`${dev.name} turned ${dev.on ? "on" : "off"}`);
      renderAll();
      updateStats();
    });
  });
}

// ============ RENDER: SECURITY PAGE DEVICE LIST ============
function renderSecurityDevices() {
  const secGrid = document.getElementById("securityGrid");
  secGrid.innerHTML = "";
  devices.filter(d => d.room === "security").forEach(d => secGrid.appendChild(buildDeviceCard(d)));
  bindToggles(secGrid);
}

// ============ RENDER: HOME QUICK TILES ============
function renderQuickTiles() {
  const qGrid = document.getElementById("quickGrid");
  qGrid.innerHTML = "";
  quickIds.forEach(id => {
    const d = devices.find(x => x.id === id);
    const tile = document.createElement("button");
    tile.className = "quick-tile" + (d.on ? " on" : "");
    tile.setAttribute("aria-pressed", d.on);
    tile.innerHTML = `<span class="quick-ico">${d.icon}</span><span class="quick-name">${d.name}</span>`;
    tile.addEventListener("click", () => {
      d.on = !d.on;
      logActivity(`${d.name} turned ${d.on ? "on" : "off"}`);
      renderAll();
      updateStats();
    });
    qGrid.appendChild(tile);
  });
}

function renderAll(filterText = "") {
  renderDevices(filterText);
  renderSecurityDevices();
  renderQuickTiles();
}

// ============ ROOM CHIPS ============
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentRoom = chip.dataset.room;
    renderDevices(document.getElementById("deviceSearch").value);
  });
});

// ============ SEARCH ============
document.getElementById("deviceSearch").addEventListener("input", (e) => {
  renderDevices(e.target.value);
});

// ============ STATS ============
function updateStats() {
  const activeCount = devices.filter(d => d.on).length;
  document.getElementById("statActiveDevices").innerHTML = `${activeCount}<span>/${devices.length}</span>`;

  const baseTemp = 21 + Math.sin(Date.now() / 90000) * 1.2;
  document.getElementById("statTemp").innerHTML = `${baseTemp.toFixed(1)}<span>°C</span>`;
  document.getElementById("statHumidity").innerHTML = `${44 + Math.round(Math.sin(Date.now() / 60000) * 4)}<span>%</span>`;

  const latestEnergy = energyHistory[energyHistory.length - 1];
  document.getElementById("statEnergy").innerHTML = `${latestEnergy.toFixed(1)}<span>kWh</span>`;

  const pulseScore = Math.min(100, Math.round(60 + activeCount * 2 + (armed ? 8 : 0)));
  document.getElementById("pulseValue").textContent = pulseScore;
  const circumference = 314;
  document.getElementById("pulseProgress").style.strokeDashoffset = circumference - (pulseScore / 100) * circumference;
}

// ============ CLOCK ============
function tickClock() {
  document.getElementById("statusClock").textContent =
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
setInterval(tickClock, 1000);
tickClock();

// ============ THERMOSTAT ============
const thermoSlider = document.getElementById("thermoSlider");
const thermoValue = document.getElementById("thermoValue");
function setThermo(val) {
  val = Math.max(16, Math.min(28, val));
  thermoSlider.value = val;
  thermoValue.textContent = val;
}
document.getElementById("thermoUp").addEventListener("click", () => setThermo(Number(thermoSlider.value) + 1));
document.getElementById("thermoDown").addEventListener("click", () => setThermo(Number(thermoSlider.value) - 1));
thermoSlider.addEventListener("input", (e) => setThermo(Number(e.target.value)));

// ============ SECURITY ARM/DISARM ============
const armBtn = document.getElementById("armToggle");
armBtn.addEventListener("click", () => {
  armed = !armed;
  armBtn.textContent = armed ? "Armed" : "Disarmed";
  armBtn.className = "arm-btn " + (armed ? "armed" : "disarmed");
  logActivity(armed ? "Security system armed" : "Security system disarmed");
  updateStats();
});

// ============ ACTIVITY LOG ============
const logEl = document.getElementById("activityLog");
function logActivity(text) {
  const li = document.createElement("li");
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  li.innerHTML = `<time>${time}</time><span>${text}</span>`;
  logEl.prepend(li);
  while (logEl.children.length > 6) logEl.removeChild(logEl.lastChild);
}

// ============ NOTIFICATIONS ============
document.getElementById("notifBtn").addEventListener("click", () => {
  document.getElementById("notifBadge").style.display = "none";
  logActivity("Notifications viewed");
});

// ============ CHART (safe: never blocks the rest of the app) ============
let energyChart = null;

function initChart() {
  const canvas = document.getElementById("energyChart");
  if (typeof Chart === "undefined" || !canvas) {
    // Chart.js CDN unavailable (e.g. offline) — show a simple fallback bar strip instead.
    if (canvas) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;align-items:flex-end;gap:6px;height:150px;padding-top:10px;";
      energyHistory.forEach(v => {
        const bar = document.createElement("div");
        bar.style.cssText = `flex:1;background:linear-gradient(180deg,#ff8fb8,#c2185b);border-radius:6px 6px 0 0;height:${Math.min(100, v * 40)}px;`;
        wrap.appendChild(bar);
      });
      canvas.replaceWith(wrap);
      wrap.id = "energyChartFallback";
    }
    return;
  }
  const ctx = canvas.getContext("2d");
  energyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: energyLabels,
      datasets: [{
        label: "kWh",
        data: energyHistory,
        borderColor: "#c2185b",
        backgroundColor: "rgba(224,68,127,0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: "#c2185b",
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: "#f4d3e1" }, ticks: { color: "#8a6b78", font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { color: "#8a6b78", font: { size: 10 } } }
      }
    }
  });
}

function pushEnergyPoint() {
  const activeCount = devices.filter(d => d.on).length;
  const next = Math.max(0.4, (activeCount * 0.22) + (Math.random() * 0.4 - 0.2) + 1);
  energyHistory.push(Number(next.toFixed(2)));
  energyHistory.shift();
  if (energyChart) {
    energyChart.data.datasets[0].data = energyHistory;
    energyChart.update();
  } else {
    const fallback = document.getElementById("energyChartFallback");
    if (fallback) {
      [...fallback.children].forEach((bar, i) => {
        bar.style.height = Math.min(100, energyHistory[i] * 40) + "px";
      });
    }
  }
}

// ============ INIT + LOOPS ============
renderAll();
updateStats();
logActivity("Dashboard connected to home network");

try { initChart(); } catch (err) { console.warn("Chart init skipped:", err); }

setInterval(() => { pushEnergyPoint(); updateStats(); }, 3000);
setInterval(updateStats, 5000);
