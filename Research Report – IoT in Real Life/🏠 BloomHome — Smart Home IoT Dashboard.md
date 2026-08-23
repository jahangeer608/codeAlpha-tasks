# 🏠 BloomHome — Smart Home IoT Dashboard

A modern, responsive **Smart Home IoT Dashboard** built with HTML, CSS, and JavaScript. BloomHome provides a mobile-style interface for monitoring connected home devices, energy consumption, temperature, humidity, thermostat settings, and home security.

The interface is designed as a realistic smart-home control application with multiple interactive sections, including Home, Devices, Energy, Security, and Profile. The HTML structure includes a dashboard pulse indicator, device statistics, quick controls, recent activity, device search, energy visualization, thermostat controls, security cameras, and profile settings.

## ✨ Features

- 🏠 Smart Home dashboard
- 📱 Mobile-app style responsive interface
- ⚡ Connected device monitoring
- 📊 Energy consumption visualization
- 🌡️ Temperature and humidity monitoring
- 🎛️ Thermostat temperature control
- 🔐 Home security monitoring
- 📹 Front-door and backyard camera panels
- 🔎 Device search functionality
- 🛋️ Room-based device filtering
- 🔔 Notification indicator
- 👤 User profile section
- 📈 Live-style home statistics
- 🧭 Bottom navigation between application sections
- 📊 Chart.js integration for energy visualization

The dashboard provides separate pages for devices, energy, security, and profile management through the bottom navigation system.

## 🛠️ Technologies Used

- **HTML5** — Application structure
- **CSS3** — UI design, responsive layout, animations, and styling
- **JavaScript** — Interactive functionality and dynamic data
- **Chart.js** — Energy usage visualization
- **Google Fonts** — Poppins, Inter, and JetBrains Mono

Chart.js is loaded through jsDelivr, while the project uses Google Fonts and a separate `style.css` stylesheet. 
## 📂 Project Structure

```text
BloomHome/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### `index.html`
Contains the main application interface, including the dashboard, device controls, energy section, security section, profile section, and navigation.

### `style.css`
Contains the visual design and responsive styling for the application.

### `script.js`
Handles dynamic data, interactions, device controls, navigation, charts, thermostat controls, and dashboard functionality.

## 🚀 How to Run

### Method 1 — VS Code + Live Server

1. Download or clone this repository.
2. Open the project folder in **Visual Studio Code**.
3. Make sure `index.html`, `style.css`, and `script.js` are in the same folder.
4. Install the **Live Server** extension in VS Code.
5. Right-click `index.html`.
6. Select **Open with Live Server**.
7. The BloomHome dashboard will open in your browser.

### Method 2 — Direct Browser

You can also open `index.html` directly in a modern browser. For the best development experience, Live Server is recommended.

## 📊 Dashboard Sections

### 🏠 Home

The Home screen displays:

- Home Pulse
- Active devices
- Energy consumption
- Temperature
- Humidity
- Quick controls
- Recent activity

The dashboard is structured around these smart-home statistics and controls.

### ⚡ Devices

The Devices section allows users to browse connected devices by:

- All
- Living Room
- Kitchen
- Bedroom
- Security

It also includes a device search field for quickly finding devices.

### 📈 Energy

The Energy page provides:

- Live energy usage chart
- Thermostat display
- Temperature increase/decrease controls
- Temperature slider from **16°C to 28°C**



### 🔐 Security

The Security section provides:

- System armed/disarmed status
- Front Door camera
- Backyard camera
- Security device monitoring



### 👤 Profile

The Profile page contains:

- User profile
- Connected rooms
- Connected devices
- Household members
- Notification settings
- Network & hub status
- Help & support



## 🎨 UI Design

BloomHome uses a clean mobile-first application layout with a dedicated app screen, status bar, header, dashboard pages, cards, controls, and bottom navigation.

The interface uses **Poppins, Inter, and JetBrains Mono** typography for a modern application appearance.

## 🔮 Future Improvements

Possible future enhancements include:

- Real IoT sensor integration
- MQTT support
- ESP32/Arduino integration
- Firebase real-time database
- Real-time temperature sensors
- Real energy meters
- Smart lighting automation
- Voice commands
- AI-based energy optimization
- Push notifications
- Real security-camera streams
- User authentication
- Cloud synchronization

## 📚 External Libraries & References

- **Chart.js:** [Chart.js Official Documentation](https://www.chartjs.org/docs/latest/?utm_source=chatgpt.com)
- **Google Fonts:** [Google Fonts](https://fonts.google.com/?utm_source=chatgpt.com)
- **MDN HTML Documentation:** [MDN HTML](https://developer.mozilla.org/en-US/docs/Web/HTML?utm_source=chatgpt.com)
- **MDN CSS Documentation:** [MDN CSS](https://developer.mozilla.org/en-US/docs/Web/CSS?utm_source=chatgpt.com)
- **MDN JavaScript Documentation:** [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript?utm_source=chatgpt.com)

## 👨‍💻 Developer

**Muhammad Jahangeer**  
BS Artificial Intelligence | AI Developer

This project was developed as an **IoT / Smart Home application project** demonstrating how a web-based dashboard can represent and control connected smart-home devices.

## 📄 License

This project is intended for **educational and portfolio purposes**. You may modify and extend the project for learning, academic, and personal development.

---

⭐ **If you found this project useful, consider giving the repository a star!**

**BloomHome — Smart living through connected technology. 🏠⚡**