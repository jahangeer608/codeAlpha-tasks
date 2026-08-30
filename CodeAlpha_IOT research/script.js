(function () {
"use strict";

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
let tempUnit = "C"; // "C" or "F" — display only; thermostat stays stored in Celsius internally
let lastFocusedDeviceId = null;
let lastBriefingText = "";

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function celsiusToF(c) { return c * 9 / 5 + 32; }
function formatTemp(celsiusValue, decimals) {
  const val = tempUnit === "F" ? celsiusToF(celsiusValue) : celsiusValue;
  return val.toFixed(decimals) + "°" + tempUnit;
}

// ============ TOAST ============
const toastEl = document.getElementById("toast");
let toastTimer = null;
function showToast(message, type) {
  toastEl.textContent = message;
  toastEl.className = "toast show" + (type === "error" ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.className = "toast"; }, 2800);
}

// ============ GREETING ============
function updateGreeting() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  document.getElementById("greetEyebrow").textContent = greet;
}

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
    grid.innerHTML = `<p class="empty-note">No devices match your search.</p>`;
    return;
  }

  list.forEach(d => grid.appendChild(buildDeviceCard(d)));
  bindCardControls(grid);
}

function buildDeviceCard(d) {
  const card = document.createElement("div");
  card.className = "device-card" + (d.on ? " on" : "");
  card.innerHTML = `
    <div class="device-top">
      <span class="device-icon" aria-hidden="true">${d.icon}</span>
      <div class="device-top-actions">
        <button class="speak-btn" type="button" data-speak-id="${d.id}" aria-label="Announce ${d.name} status">&#128266;</button>
        <label class="switch">
          <input type="checkbox" data-id="${d.id}" ${d.on ? "checked" : ""} aria-label="Toggle ${d.name}">
          <span class="slider-toggle"></span>
        </label>
      </div>
    </div>
    <p class="device-name">${d.name}</p>
    <p class="device-room">${capitalize(d.room)}</p>
    <p class="device-meta">${d.on ? d.meta : "Standby"}</p>
  `;
  return card;
}

function bindCardControls(container) {
  container.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", (e) => {
      const id = Number(e.target.dataset.id);
      lastFocusedDeviceId = id;
      const dev = devices.find(x => x.id === id);
      dev.on = e.target.checked;
      logActivity(`${dev.name} turned ${dev.on ? "on" : "off"}`);
      renderAll();
      updateStats();
      restoreFocus();
    });
  });
  container.querySelectorAll(".speak-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.speakId);
      const dev = devices.find(x => x.id === id);
      speak(`${dev.name} is ${dev.on ? "on" : "off"}. ${dev.on ? dev.meta : "Standby."}`);
    });
  });
}

function restoreFocus() {
  if (lastFocusedDeviceId == null) return;
  const el = document.querySelector(`input[data-id="${lastFocusedDeviceId}"]`);
  if (el) el.focus({ preventScroll: true });
}

// ============ RENDER: SECURITY PAGE DEVICE LIST ============
function renderSecurityDevices() {
  const secGrid = document.getElementById("securityGrid");
  secGrid.innerHTML = "";
  devices.filter(d => d.room === "security").forEach(d => secGrid.appendChild(buildDeviceCard(d)));
  bindCardControls(secGrid);
}

// ============ RENDER: HOME QUICK TILES ============
function renderQuickTiles() {
  const qGrid = document.getElementById("quickGrid");
  qGrid.innerHTML = "";
  quickIds.forEach(id => {
    const d = devices.find(x => x.id === id);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "quick-tile" + (d.on ? " on" : "");
    tile.setAttribute("aria-pressed", d.on);
    tile.innerHTML = `<span class="quick-ico" aria-hidden="true">${d.icon}</span><span class="quick-name">${d.name}</span>`;
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

  const baseTempC = 21 + Math.sin(Date.now() / 90000) * 1.2;
  const tempValue = tempUnit === "F" ? celsiusToF(baseTempC) : baseTempC;
  document.getElementById("statTemp").textContent = tempValue.toFixed(1);
  document.getElementById("tempUnitLabel").textContent = "°" + tempUnit;
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

// ============ THERMOSTAT ============
const thermoSlider = document.getElementById("thermoSlider");
const thermoValue = document.getElementById("thermoValue");
const thermoUnitEl = document.getElementById("thermoUnit");

function renderThermo() {
  const c = Number(thermoSlider.value);
  thermoValue.textContent = tempUnit === "F" ? Math.round(celsiusToF(c)) : c;
  thermoUnitEl.textContent = "°" + tempUnit;
}

function setThermo(valC) {
  valC = Math.max(16, Math.min(28, valC));
  thermoSlider.value = valC;
  renderThermo();
}
document.getElementById("thermoUp").addEventListener("click", () => setThermo(Number(thermoSlider.value) + 1));
document.getElementById("thermoDown").addEventListener("click", () => setThermo(Number(thermoSlider.value) - 1));
thermoSlider.addEventListener("input", (e) => setThermo(Number(e.target.value)));

// ============ TEMPERATURE UNIT TOGGLE ============
const unitCBtn = document.getElementById("unitCBtn");
const unitFBtn = document.getElementById("unitFBtn");
function setTempUnit(unit) {
  tempUnit = unit;
  unitCBtn.setAttribute("aria-pressed", String(unit === "C"));
  unitFBtn.setAttribute("aria-pressed", String(unit === "F"));
  renderThermo();
  updateStats();
}
unitCBtn.addEventListener("click", () => setTempUnit("C"));
unitFBtn.addEventListener("click", () => setTempUnit("F"));

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
  showToast("3 notifications marked as read.");
});

// ============ SETTINGS LIST ROWS (now functional) ============
const listRowInfo = {
  household: "Household: Aisha Khan (Owner). Invite more members from this screen in a future update.",
  notifications: "Notification settings: security and energy alerts are currently turned on.",
  network: "Network & hub status: Home hub is online and connected to Wi-Fi.",
  help: "Help & support: for now, reach out to support@bloomhome.example."
};
document.querySelectorAll(".list-row").forEach(row => {
  row.addEventListener("click", () => {
    showToast(listRowInfo[row.dataset.info] || "Coming soon.");
  });
});

// ============ TEXT-TO-SPEECH ============
const speechSupported = "speechSynthesis" in window;
const voiceSelect = document.getElementById("voiceSelect");
const briefingBtn = document.getElementById("briefingBtn");
const repeatBriefingBtn = document.getElementById("repeatBriefingBtn");
const voiceSupportNote = document.getElementById("voiceSupportNote");

function populateVoices() {
  if (!speechSupported) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  const previousValue = voiceSelect.value;
  voiceSelect.innerHTML = "";
  voices.forEach((voice, i) => {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  if (!previousValue) {
    const browserLang = (navigator.language || "en").toLowerCase();
    const matchIndex = voices.findIndex(v => v.lang.toLowerCase().startsWith(browserLang.slice(0, 2)));
    if (matchIndex >= 0) voiceSelect.value = String(matchIndex);
  } else {
    voiceSelect.value = previousValue;
  }
}

if (speechSupported) {
  populateVoices();
  window.speechSynthesis.addEventListener("voiceschanged", populateVoices);
} else {
  briefingBtn.disabled = true;
  repeatBriefingBtn.disabled = true;
  voiceSelect.disabled = true;
  voiceSelect.innerHTML = '<option>Not supported</option>';
  voiceSupportNote.textContent = "Text-to-speech isn't supported in this browser.";
}

function speak(text) {
  if (!speechSupported || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices[Number(voiceSelect.value)];
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.onstart = () => briefingBtn.classList.add("speaking");
  utterance.onend = () => briefingBtn.classList.remove("speaking");
  utterance.onerror = () => briefingBtn.classList.remove("speaking");
  window.speechSynthesis.speak(utterance);
}

function buildBriefing() {
  const activeCount = devices.filter(d => d.on).length;
  const pulseScore = document.getElementById("pulseValue").textContent;
  const temp = formatTemp(21 + Math.sin(Date.now() / 90000) * 1.2, 0);
  const humidity = document.getElementById("statHumidity").textContent;
  const energy = document.getElementById("statEnergy").textContent;

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return `${greet}, Aisha. Home pulse is ${pulseScore} out of 100. ` +
         `${activeCount} of ${devices.length} devices are active, using ${energy}. ` +
         `Indoor temperature is ${temp}, humidity ${humidity}. ` +
         `Security system is currently ${armed ? "armed" : "disarmed"}.`;
}

briefingBtn.addEventListener("click", () => {
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    briefingBtn.classList.remove("speaking");
    return;
  }
  lastBriefingText = buildBriefing();
  speak(lastBriefingText);
});

repeatBriefingBtn.addEventListener("click", () => {
  const text = lastBriefingText || buildBriefing();
  speak(text);
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

// ============ INIT + LOOPS (consolidated, pause when tab hidden) ============
renderAll();
updateGreeting();
updateStats();
renderThermo();
logActivity("Dashboard connected to home network");

try { initChart(); } catch (err) { console.warn("Chart init skipped:", err); }

let mainInterval = null;
function startLoops() {
  if (mainInterval) return;
  tickClock();
  mainInterval = setInterval(() => {
    tickClock();
    pushEnergyPoint();
    updateStats();
  }, 3000);
}
function stopLoops() {
  clearInterval(mainInterval);
  mainInterval = null;
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopLoops(); else startLoops();
});
startLoops();

})();
