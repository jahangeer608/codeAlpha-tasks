// ============================================================
// IoT Sensor-Based Simulation — LED on/off using a virtual sensor
// Modes: Temperature | Light (LDR) | Motion (PIR)
// Pure client-side simulation — mirrors the logic you'd flash to
// a real microcontroller (Arduino/ESP32) in Tinkercad/Proteus.
// No external services, no build step, no dependencies — runs
// identically in any modern desktop or mobile browser.
// ============================================================

const state = {
  sensor: "temperature",
  ledOn: false,
  motionTimer: null,
  tempUnit: "C",
  pronounce: false,
  activations: 0,
  ledOnSince: null,
  ledOnMs: 0,
  bootTime: Date.now(),
};

// ---- DOM references ----
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".sensor-view");

const tempRange = document.getElementById("tempRange");
const tempValue = document.getElementById("tempValue");
const tempUnitLabel = document.getElementById("tempUnitLabel");
const tempThresh = document.getElementById("tempThresh");
const tempThreshVal = document.getElementById("tempThreshVal");
const unitCBtn = document.getElementById("unitC");
const unitFBtn = document.getElementById("unitF");

const lightRange = document.getElementById("lightRange");
const lightValue = document.getElementById("lightValue");
const lightThresh = document.getElementById("lightThresh");
const lightThreshVal = document.getElementById("lightThreshVal");

const motionBtn = document.getElementById("motionBtn");
const motionHold = document.getElementById("motionHold");
const pirTimeline = document.getElementById("pirTimeline");

const ledCircle = document.getElementById("ledCircle");
const ledIndicatorDot = document.getElementById("ledIndicatorDot");
const ledStateText = document.getElementById("ledStateText");
const wire1 = document.getElementById("wire1");
const wire2 = document.getElementById("wire2");
const mcuLogicText = document.getElementById("mcuLogicText");

const systemDot = document.getElementById("systemDot");
const systemStatusText = document.getElementById("systemStatusText");
const monitor = document.getElementById("monitor");
const codeBlock = document.getElementById("codeBlock");
const srAnnouncer = document.getElementById("srAnnouncer");

const pronounceToggle = document.getElementById("pronounceToggle");
const clearLogBtn = document.getElementById("clearLogBtn");
const downloadLogBtn = document.getElementById("downloadLogBtn");

const statUptime = document.getElementById("statUptime");
const statSensor = document.getElementById("statSensor");
const statActivations = document.getElementById("statActivations");
const statOnTime = document.getElementById("statOnTime");

const SENSOR_NAMES = { temperature: "Temperature", light: "Light", motion: "Motion" };

// ---- Code snippets shown per sensor mode (for "code explanation") ----
const CODE_SNIPPETS = {
  temperature: `// Arduino-style pseudocode — Temperature Sensor -> LED
const int SENSOR_PIN = A0;   // e.g. LM35 / DHT11
const int LED_PIN     = 8;
float threshold        = 30.0; // °C

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  float tempC = readTemperature(SENSOR_PIN);

  if (tempC > threshold) {
    digitalWrite(LED_PIN, HIGH);   // LED ON
    Serial.println("LED ON - Temp high");
  } else {
    digitalWrite(LED_PIN, LOW);    // LED OFF
    Serial.println("LED OFF - Temp normal");
  }
  delay(500);
}`,
  light: `// Arduino-style pseudocode — LDR (Light) Sensor -> LED
const int LDR_PIN = A0;
const int LED_PIN = 8;
int threshold       = 200; // lux equivalent (analog reading)

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = analogRead(LDR_PIN);

  if (lightLevel < threshold) {
    digitalWrite(LED_PIN, HIGH);   // Dark -> LED ON
    Serial.println("LED ON - It's dark");
  } else {
    digitalWrite(LED_PIN, LOW);    // Bright -> LED OFF
    Serial.println("LED OFF - Sufficient light");
  }
  delay(500);
}`,
  motion: `// Arduino-style pseudocode — PIR Motion Sensor -> LED
const int PIR_PIN = 2;
const int LED_PIN = 8;
unsigned long ON_TIME = 4000; // ms LED stays on

unsigned long lastTrigger = 0;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(PIR_PIN) == HIGH) {
    lastTrigger = millis();
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Motion detected - LED ON");
  }

  if (millis() - lastTrigger > ON_TIME) {
    digitalWrite(LED_PIN, LOW);   // auto off after timeout
  }
}`,
};

// ---- Speech (pronounce) ----
const speechSupported = "speechSynthesis" in window;
if (!speechSupported) {
  pronounceToggle.disabled = true;
  pronounceToggle.title = "Speech is not supported in this browser";
  pronounceToggle.textContent = "\u{1F507} Pronounce: N/A";
}

function speak(text) {
  if (!state.pronounce || !speechSupported || !text) return;
  try {
    window.speechSynthesis.cancel(); // don't let utterances pile up on rapid changes
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    // Fail silently — speech is an enhancement, never blocks the simulation
    console.warn("Speech synthesis unavailable:", err);
  }
}

pronounceToggle.addEventListener("click", () => {
  state.pronounce = !state.pronounce;
  pronounceToggle.setAttribute("aria-pressed", String(state.pronounce));
  pronounceToggle.textContent = `\u{1F50A} Pronounce: ${state.pronounce ? "On" : "Off"}`;
  if (state.pronounce) {
    speak(`Pronounce mode on. ${SENSOR_NAMES[state.sensor]} sensor active. LED is ${state.ledOn ? "on" : "off"}.`);
  } else if (speechSupported) {
    window.speechSynthesis.cancel();
  }
});

// ---- Helpers ----
function logToMonitor(message, cls) {
  const line = document.createElement("div");
  const time = new Date().toLocaleTimeString();
  line.textContent = `[${time}] ${message}`;
  if (cls) line.classList.add(cls);
  monitor.appendChild(line);
  monitor.scrollTop = monitor.scrollHeight;
  // keep log from growing unbounded
  while (monitor.childNodes.length > 80) {
    monitor.removeChild(monitor.firstChild);
  }
  srAnnouncer.textContent = message;
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function setLed(on, reasonOn, reasonOff) {
  if (on === state.ledOn) return; // no change, no spam
  state.ledOn = on;

  ledCircle.classList.toggle("on", on);
  ledIndicatorDot.classList.toggle("on", on);
  wire1.classList.toggle("active", on);
  wire2.classList.toggle("active", on);
  ledStateText.textContent = `LED: ${on ? "ON" : "OFF"}`;

  systemDot.classList.toggle("on", on);
  systemStatusText.textContent = on ? "LED ACTIVE" : "SYSTEM IDLE";

  const message = on ? reasonOn : reasonOff;
  logToMonitor(message, on ? "ev-on" : "ev-off");
  speak(message);

  if (on) {
    state.activations += 1;
    state.ledOnSince = Date.now();
    statActivations.textContent = String(state.activations);
  } else if (state.ledOnSince) {
    state.ledOnMs += Date.now() - state.ledOnSince;
    state.ledOnSince = null;
  }
}

// ---- Temperature logic ----
function toF(c) { return (c * 9) / 5 + 32; }
function toC(f) { return ((f - 32) * 5) / 9; }

function evaluateTemperature() {
  const tempC = parseFloat(tempRange.value);
  const threshC = parseFloat(tempThresh.value);
  const unit = state.tempUnit;

  const displayTemp = unit === "C" ? tempC : toF(tempC);
  const displayThresh = unit === "C" ? threshC : toF(threshC);

  tempValue.textContent = displayTemp.toFixed(0);
  tempUnitLabel.textContent = unit;
  tempThreshVal.textContent = displayThresh.toFixed(0);
  mcuLogicText.textContent = `if(T>${threshC.toFixed(0)}C)`;

  const shouldBeOn = tempC > threshC;
  setLed(
    shouldBeOn,
    `Temp = ${displayTemp.toFixed(1)}\u00B0${unit} > ${displayThresh.toFixed(1)}\u00B0${unit} \u2192 LED ON`,
    `Temp = ${displayTemp.toFixed(1)}\u00B0${unit} \u2264 ${displayThresh.toFixed(1)}\u00B0${unit} \u2192 LED OFF`
  );
}

function setTempUnit(unit) {
  if (unit === state.tempUnit) return;
  state.tempUnit = unit;
  unitCBtn.classList.toggle("active", unit === "C");
  unitFBtn.classList.toggle("active", unit === "F");
  evaluateTemperature();
}

// ---- Light logic ----
function evaluateLight() {
  const lux = parseInt(lightRange.value, 10);
  const threshold = parseInt(lightThresh.value, 10);
  lightValue.textContent = lux;
  lightThreshVal.textContent = threshold;
  mcuLogicText.textContent = `if(L<${threshold})`;

  const shouldBeOn = lux < threshold;
  setLed(
    shouldBeOn,
    `Light = ${lux} lux < ${threshold} lux \u2192 LED ON (dark)`,
    `Light = ${lux} lux \u2265 ${threshold} lux \u2192 LED OFF`
  );
}

// ---- Motion logic ----
function triggerMotion() {
  const holdSeconds = Math.max(1, Math.min(15, parseFloat(motionHold.value) || 4));
  mcuLogicText.textContent = `pirHIGH`;
  logToMonitor("PIR pulse received \u2192 motion detected", "ev-on");
  speak("Motion detected. LED on.");
  setLed(true, "Motion detected \u2192 LED ON", "");

  // visual pulse on timeline
  const pulse = document.createElement("div");
  pulse.className = "pir-pulse";
  pirTimeline.appendChild(pulse);
  while (pirTimeline.childNodes.length > 40) {
    pirTimeline.removeChild(pirTimeline.firstChild);
  }

  clearTimeout(state.motionTimer);
  state.motionTimer = setTimeout(() => {
    setLed(false, "", `No motion for ${holdSeconds}s \u2192 LED OFF (timeout)`);
    mcuLogicText.textContent = `pirLOW`;
  }, holdSeconds * 1000);
}

// ---- Tab switching ----
function switchSensor(sensor) {
  state.sensor = sensor;
  clearTimeout(state.motionTimer);
  document.body.dataset.sensor = sensor;

  tabs.forEach((t) => {
    const active = t.dataset.sensor === sensor;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
  });
  views.forEach((v) => v.classList.toggle("hidden", v.dataset.view !== sensor));

  codeBlock.textContent = CODE_SNIPPETS[sensor];
  statSensor.textContent = SENSOR_NAMES[sensor];

  logToMonitor(`--- Switched to ${sensor.toUpperCase()} sensor mode ---`, "ev-sys");

  if (sensor === "temperature") evaluateTemperature();
  if (sensor === "light") evaluateLight();
  if (sensor === "motion") {
    setLed(false, "", "Waiting for motion...");
    mcuLogicText.textContent = "pirLOW";
  }
}

// ---- Log export / clear ----
clearLogBtn.addEventListener("click", () => {
  monitor.innerHTML = "";
  logToMonitor("Log cleared.", "ev-sys");
});

downloadLogBtn.addEventListener("click", () => {
  const lines = Array.from(monitor.childNodes).map((n) => n.textContent).join("\n");
  const blob = new Blob([lines || "(empty log)"], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `serial-monitor-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ---- Dashboard ticker (uptime + LED on-time) ----
function tick() {
  statUptime.textContent = formatDuration(Date.now() - state.bootTime);
  const liveOnMs = state.ledOnMs + (state.ledOnSince ? Date.now() - state.ledOnSince : 0);
  statOnTime.textContent = formatDuration(liveOnMs);
}
setInterval(tick, 1000);
tick();

// ---- Event listeners ----
tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchSensor(tab.dataset.sensor));
});

tempRange.addEventListener("input", evaluateTemperature);
tempThresh.addEventListener("input", evaluateTemperature);
unitCBtn.addEventListener("click", () => setTempUnit("C"));
unitFBtn.addEventListener("click", () => setTempUnit("F"));

lightRange.addEventListener("input", evaluateLight);
lightThresh.addEventListener("input", evaluateLight);

motionBtn.addEventListener("click", triggerMotion);

// ---- Init ----
codeBlock.textContent = CODE_SNIPPETS.temperature;
logToMonitor("System booted. Temperature sensor mode active.", "ev-sys");
evaluateTemperature();
