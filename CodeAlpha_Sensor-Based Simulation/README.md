# Sensor-Based IoT Simulation — LED Control via Virtual Sensor

## 1. Assignment Prompt (for reference / submission cover page)

> **Task:** Simulate an IoT system without physical hardware.
> Build a circuit in which an **LED turns on/off automatically based on a sensor
> reading** (Temperature, Light, or Motion). Demonstrate the simulation with
> screenshots and explain the underlying code/logic.

This project satisfies that brief as a **browser-based circuit simulator**
(`index.html` + `style.css` + `script.js`) that behaves like a Tinkercad/Proteus
sketch: a virtual sensor feeds a virtual "microcontroller," which drives a
virtual LED — with a live serial monitor log and a spoken status readout,
exactly like the Serial Monitor in Tinkercad's Arduino simulator plus an
accessibility layer real boards don't have.

If your instructor specifically requires **Tinkercad or Proteus screenshots**,
open [Tinkercad Circuits](https://www.tinkercad.com/circuits), build the same
three-component circuit (sensor → Arduino Uno → LED + resistor), paste in the
matching sketch from `script.js`'s `CODE_SNIPPETS`, run the simulation, and
screenshot the "Code" + "Circuit" views. The logic, thresholds, and comments
below transfer directly — this web app is a "dry run" you can use to test the
logic before wiring it up in Tinkercad.

## 2. How to run this project

No installation and no internet connection is required beyond loading the
optional Google Fonts (the app falls back to system fonts if that request
fails, so it still works fully offline).

1. Open the `iot-sensor-sim` folder in VS Code (or any editor/file browser).
2. Easiest: just double-click `index.html` to open it in any browser — no
   build step, no dependencies, no server.
3. Optional: install the **Live Server** extension in VS Code and right-click
   `index.html` → "Open with Live Server" for auto-reload while you edit.
4. The dashboard is responsive — resize the window or open it on a phone
   browser to see the mobile layout. It works the same in Chrome, Edge,
   Firefox and Safari, and on Windows, macOS, Linux, Android and iOS.

Files:
- `index.html` — page structure (dashboard, sensor tabs, circuit diagram, monitor, code panel)
- `style.css` — PCB/circuit-board themed styling, per-sensor colour identity, mobile responsive
- `script.js` — all simulation logic (fully functional, no stubs, no console errors)

## 3. What's new in this version

- **Live dashboard bar** — uptime, active sensor, total LED activations, and
  cumulative LED on-time, all updating in real time.
- **Distinct LED colour per sensor** — the LED, wires, active tab, and chip
  all shift to a warm red-orange for Temperature, amber for Light, and cyan
  for Motion, so the board visually tells you which circuit is live.
- **Animated current-flow dots** travel along the wires whenever the LED is
  on, reinforcing the sensor → logic → actuator story.
- **Spoken status readout ("Pronounce")** — a toggle in the Serial Monitor
  panel uses the browser's built-in Web Speech API to read each LED
  transition and mode switch aloud. No audio files, no server, no API key;
  it degrades gracefully (the button disables itself) in the rare browser
  that lacks speech synthesis support.
- **°C / °F toggle** for the temperature sensor, and an **adjustable PIR hold
  time** for the motion sensor (was hard-coded to 4s).
- **Clear log** and **Save log** (downloads a `.txt` transcript) controls on
  the Serial Monitor.
- **Accessibility pass** — proper tab/`role="tablist"` semantics, visible
  keyboard focus rings, `aria-live` status announcements, and
  `prefers-reduced-motion` support so the flowing-current animation and
  transitions turn off for users who've asked their OS for reduced motion.

## 4. Code Explanation

### Architecture
The app models the three things a real embedded sketch has:
1. **Sensor read** — a slider (temperature/light) or button (motion) stands in
   for `analogRead()` / `digitalRead()`.
2. **Decision logic** (`evaluateTemperature`, `evaluateLight`, `triggerMotion`
   in `script.js`) — mirrors the `if (condition) { ... } else { ... }` block
   you'd write in `loop()` on a real MCU.
3. **Actuator output** — `setLed()` updates the LED's visual state (SVG fill +
   glow), the wires' "active" highlight, the dashboard stats, the spoken
   readout, and writes a timestamped line to the on-screen Serial Monitor —
   just like `digitalWrite(LED_PIN, HIGH)` + `Serial.println(...)` would on
   hardware.

### Temperature mode
```js
const shouldBeOn = tempC > threshold;
```
The LED is switched on once the simulated temperature exceeds a
user-adjustable threshold (default 30°C) — equivalent to a fan/alert LED
turning on when it gets too hot. Display unit (°C/°F) is cosmetic only; the
comparison always happens in °C to match the underlying "sensor" value.

### Light mode
```js
const shouldBeOn = lux < threshold;
```
Models a **light-dependent resistor (LDR)**: when ambient light drops below
the threshold (default 200 lux), the LED turns on — the classic "automatic
street light / night light" circuit.

### Motion mode
```js
setLed(true, ...);
clearTimeout(state.motionTimer);
state.motionTimer = setTimeout(() => setLed(false, ...), holdSeconds * 1000);
```
Models a **PIR motion sensor**: tapping "Trigger Motion Pulse" simulates the
PIR pin going HIGH. The LED turns on immediately and a `setTimeout` mirrors
the real-world debounce/hold logic (`millis() - lastTrigger > ON_TIME`) that
auto-turns the LED off after the configured hold time (default 4s) of no
further motion.

### Why the thresholds are adjustable
Real datasheets specify calibration thresholds (comparator voltage, lux
rating, PIR hold time). Making them editable inputs demonstrates you
understand these are **tunable parameters**, not hard-coded magic numbers —
a common thing instructors check for.

## 5. What to screenshot for submission
1. Temperature tab with the LED **OFF** (temp below threshold) + Serial Monitor line.
2. Temperature tab with the LED **ON** (temp above threshold) + Serial Monitor line.
3. Light tab showing the dark → LED ON transition.
4. Motion tab right after triggering a pulse (LED on, pulse visible on the timeline).
5. The dashboard stats bar showing non-zero activations/on-time.
6. The Code Explanation panel (or this README) as your write-up.
