# Sensor-Based IoT Simulation — LED Control via Virtual Sensor

## 1. Assignment Prompt (for reference / submission cover page)

> **Task:** Simulate an IoT system without physical hardware.
> Build a circuit in which an **LED turns on/off automatically based on a sensor
> reading** (Temperature, Light, or Motion). Demonstrate the simulation with
> screenshots and explain the underlying code/logic.

This project satisfies that brief as a **browser-based circuit simulator**
(`index.html` + `style.css` + `script.js`) that behaves like a Tinkercad/Proteus
sketch: a virtual sensor feeds a virtual "microcontroller," which drives a
virtual LED — with a live serial monitor log, exactly like the Serial Monitor
in Tinkercad's Arduino simulator.

If your instructor specifically requires **Tinkercad or Proteus screenshots**,
open [Tinkercad Circuits](https://www.tinkercad.com/circuits), build the same
three-component circuit (sensor → Arduino Uno → LED + resistor), paste in the
matching sketch from `script.js`'s `CODE_SNIPPETS`, run the simulation, and
screenshot the "Code" + "Circuit" views. The logic, thresholds, and comments
below transfer directly — this web app is essentially a "dry run" you can use
to test the logic before wiring it up in Tinkercad.

## 2. How to run this project (VS Code)

1. Open the `iot-sensor-sim` folder in VS Code.
2. Install the **Live Server** extension (or any static server).
3. Right-click `index.html` → "Open with Live Server" (or just double-click
   `index.html` to open it in any browser — no build step, no dependencies).
4. The dashboard is responsive — resize the window or open it on a phone
   browser to see the mobile layout.

Files:
- `index.html` — page structure (sensor tabs, circuit diagram, monitor, code panel)
- `style.css` — PCB/circuit-board themed styling, mobile responsive
- `script.js` — all simulation logic (fully functional, no stubs)

## 3. Code Explanation

### Architecture
The app models the three things a real embedded sketch has:
1. **Sensor read** — a slider (temperature/light) or button (motion) stands in
   for `analogRead()` / `digitalRead()`.
2. **Decision logic** (`evaluateTemperature`, `evaluateLight`, `triggerMotion`
   in `script.js`) — mirrors the `if (condition) { ... } else { ... }` block
   you'd write in `loop()` on a real MCU.
3. **Actuator output** — `setLed()` updates the LED's visual state (SVG fill +
   glow), the wires' "active" highlight, and writes a timestamped line to the
   on-screen Serial Monitor, just like `digitalWrite(LED_PIN, HIGH)` +
   `Serial.println(...)` would on hardware.

### Temperature mode
```js
const shouldBeOn = tempC > threshold;
```
The LED is switched on once the simulated temperature exceeds a
user-adjustable threshold (default 30°C) — equivalent to a fan/alert LED
turning on when it gets too hot.

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
state.motionTimer = setTimeout(() => setLed(false, ...), 4000);
```
Models a **PIR motion sensor**: tapping "Trigger Motion Pulse" simulates the
PIR pin going HIGH. The LED turns on immediately and a `setTimeout` mirrors
the real-world debounce/hold logic (`millis() - lastTrigger > ON_TIME`) that
auto-turns the LED off after 4 seconds of no further motion.

### Why the thresholds are adjustable
Real datasheets specify calibration thresholds (comparator voltage, lux
rating, PIR hold time). Making them editable inputs demonstrates you
understand these are **tunable parameters**, not hard-coded magic numbers —
a common thing instructors check for.

## 4. What to screenshot for submission
1. Temperature tab with the LED **OFF** (temp below threshold) + Serial Monitor line.
2. Temperature tab with the LED **ON** (temp above threshold) + Serial Monitor line.
3. Light tab showing the dark → LED ON transition.
4. Motion tab right after triggering a pulse (LED on, pulse visible on the timeline).
5. The Code Explanation panel (or this README) as your write-up.
