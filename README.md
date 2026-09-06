# Smart Water Purification & Quality Monitoring System

An IoT-based water purification and quality monitoring system designed for **rural and mining-affected areas**. The system uses ESP32 microcontrollers with water-quality sensors to provide real-time monitoring, automated alerts, and remote control through a professional web dashboard.

## Architecture

```
ESP32 Sensors → Wi-Fi → HTTP POST → Convex Backend → Database → Real-time Dashboard
                                                                         ↓
ESP32 ← HTTP Poll ← Command Queue ← Convex Backend ← Dashboard Controls
```

### Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hardware** | ESP32 + Sensors | Read water quality parameters |
| **Backend** | Convex (serverless) | Process data, evaluate quality, store history |
| **Frontend** | React + Vite + TypeScript | Real-time monitoring dashboard |
| **Communication** | HTTP + Convex subscriptions | Bidirectional data flow |

## Features

- **Real-time monitoring** — pH, TDS, Turbidity, Temperature, Flow Rate
- **Quality alerts** — Automatic alerts when parameters exceed limits
- **Live charts** — Auto-updating trend graphs for all parameters
- **Purification workflow** — Visual pipeline status display
- **Device control** — Remote pump, solenoid, and UV control
- **History & analytics** — Historical data table with filtering
- **System status** — Connection health and device monitoring
- **Demo mode** — Generates realistic sample data for demonstrations
- **Responsive design** — Works on laptop, tablet, and mobile

## Hardware / Software Requirements

### Hardware
- ESP32 development board (ESP32-WROOM-32 or similar)
- pH sensor (analog)
- TDS sensor (analog)
- Turbidity sensor (analog)
- Temperature sensor (analog, e.g., LM35 or DS18B20)
- Water flow sensor (pulse, e.g., YF-S201)
- 3-channel relay module
- Water pump, solenoid valve, UV-C LED/lamp
- Wi-Fi router (same network for ESP32 and laptop)

### Software
- Node.js ≥ 18 (for Convex CLI)
- Bun (package manager)
- Arduino IDE (for ESP32 firmware)
- VS Code (recommended editor)

## Folder Structure

```
smart-water-iot/
├── src/                      # Frontend & Backend (Convex)
│   ├── components/           # React components
│   │   ├── AppLayout.tsx     # Main layout with sidebar
│   │   ├── WaterQualityCard.tsx
│   │   ├── QualityBanner.tsx
│   │   ├── LiveChart.tsx
│   │   └── PurificationStage.tsx
│   ├── pages/                # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── LiveMonitoring.tsx
│   │   ├── PurificationStatus.tsx
│   │   ├── AutomaticControl.tsx
│   │   ├── QualityAlerts.tsx
│   │   ├── History.tsx
│   │   ├── Analytics.tsx
│   │   ├── SystemStatusPage.tsx
│   │   └── AboutProject.tsx
│   ├── convex/               # Backend functions
│   │   ├── schema.ts         # Database schema
│   │   ├── sensorReadings.ts
│   │   ├── alerts.ts
│   │   ├── qualityLimits.ts
│   │   ├── commandQueue.ts
│   │   ├── deviceStatus.ts
│   │   ├── systemConfig.ts
│   │   ├── qualityEvaluator.ts
│   │   ├── demoMode.ts
│   │   ├── crons.ts
│   │   └── http.ts           # ESP32 HTTP endpoints
│   ├── hooks/
│   ├── lib/
│   ├── main.tsx
│   └── index.css
├── esp32/                    # ESP32 firmware
│   ├── smart_water_system/
│   │   └── smart_water_system.ino
│   └── README.md
├── package.json
└── README.md
```

## Installation & Setup

### 1. Clone and install dependencies

```bash
# Clone the project
git clone <repository-url>
cd smart-water-iot

# Install dependencies
bun install
```

### 2. Start the Convex backend

```bash
# Initialize Convex (first time only)
bun convex dev

# In a separate terminal, seed default configuration
# (This happens automatically on first dashboard load)
```

The backend runs as Convex serverless functions — there is no separate server process. The `convex dev` command pushes your functions and provides the API.

### 3. Start the frontend

```bash
bun run dev
```

Open your browser to `http://localhost:5173`

### 4. ESP32 setup

1. Open `esp32/smart_water_system/smart_water_system.ino` in Arduino IDE
2. Install the ESP32 board package and ArduinoJson library
3. Edit the configuration:
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   const char* SERVER_URL = "http://192.168.1.100:5000"; // Your laptop IP
   ```
4. Upload to your ESP32

## Network Configuration

**Important:** The ESP32 and your laptop must be on the **same Wi-Fi network**.

Example setup:
```
Laptop IP:    192.168.1.100
Backend URL:  http://192.168.1.100:5000
ESP32 sends:  POST http://192.168.1.100:5000/api/device/data
Dashboard:    http://localhost:5173
```

### Finding your laptop IP

**Windows:** `ipconfig` → Look for "IPv4 Address"
**macOS/Linux:** `ifconfig` or `hostname -I`

> **Do NOT use localhost in the ESP32 code** — localhost on the ESP32 refers to the ESP32 itself.

## Water Quality Limits (Configurable)

| Parameter | Min | Max | Unit |
|-----------|-----|-----|------|
| pH | 6.5 | 8.5 | — |
| TDS | — | 300 | ppm |
| Turbidity | — | 5 | NTU |
| Temperature | 5 | 35 | °C |

These are stored in the `qualityLimits` table and can be changed at runtime from the dashboard.

## Demo Mode

If the ESP32 is not connected, enable **DEMO_MODE** in the system config. The backend will generate realistic sensor readings every 5 seconds, including occasional anomalous values to demonstrate the alert system.

To enable: Set the `demo_mode` key to `"true"` in the `systemConfig` table. This is done automatically when you first open the dashboard.

## API Endpoints

### For ESP32 (HTTP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/device/data` | Send sensor readings |
| `GET` | `/api/device/commands/:deviceId` | Poll for commands |
| `GET` | `/api/health` | Health check |

### For Dashboard (Convex Queries)

| Query | Description |
|-------|-------------|
| `sensorReadings.getLatestAny` | Get latest reading |
| `sensorReadings.getRecent` | Get recent readings for charts |
| `sensorReadings.getHistory` | Get historical data |
| `alerts.getAll` | Get all alerts |
| `alerts.getUnresolved` | Get active alerts |
| `qualityLimits.getAll` | Get quality limits |
| `deviceStatus.getByDevice` | Get device status |

## Troubleshooting

### ESP32 not connecting
- Verify Wi-Fi credentials
- Ensure ESP32 and laptop are on the same network
- Check that the server URL uses your laptop's IP, not localhost

### No data on dashboard
- Verify Convex is running (`bun convex dev`)
- Check the ESP32 Serial Monitor for errors
- Ensure the backend is receiving data (check Convex logs)

### Charts not updating
- Convex subscriptions are real-time — check your internet connection
- Ensure the Convex deployment is active

### Build errors
- Run `bun tsc -b --noEmit` to check for TypeScript errors
- Ensure all dependencies are installed: `bun install`
