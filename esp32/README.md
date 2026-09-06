# ESP32 Smart Water System — Firmware

## Overview

This Arduino sketch runs on the ESP32 and handles:
- Reading water quality sensors (pH, TDS, Turbidity, Temperature, Flow)
- Sending sensor data to the Node.js/Convex backend via HTTP POST
- Polling for control commands from the web dashboard
- Controlling pump, solenoid valve, and UV disinfection hardware

## Hardware Requirements

- ESP32 development board (e.g., ESP32-WROOM-32)
- pH sensor module (analog output)
- TDS sensor module (analog output)
- Turbidity sensor module (analog output)
- Temperature sensor (e.g., DS18B20 or LM35)
- Water flow sensor (pulse output, e.g., YF-S201)
- Relay module (3-channel) for pump, solenoid, and UV control
- Water pump
- Solenoid valve
- UV-C LED or lamp

## Pin Connections

| Component    | ESP32 Pin | Type   |
|-------------|-----------|--------|
| pH sensor   | GPIO 36   | Analog |
| TDS sensor  | GPIO 39   | Analog |
| Turbidity   | GPIO 34   | Analog |
| Temperature | GPIO 35   | Analog |
| Flow sensor | GPIO 25   | Digital (interrupt) |
| Pump relay  | GPIO 16   | Digital (output) |
| Solenoid    | GPIO 17   | Digital (output) |
| UV relay    | GPIO 18   | Digital (output) |

## Setup

1. Install [Arduino IDE](https://www.arduino.cc/en/software) or [PlatformIO](https://platformio.org/)
2. Install the ESP32 board package
3. Install the ArduinoJson library: `Tools → Manage Libraries → search "ArduinoJson"`
4. Open `smart_water_system.ino`
5. Edit the configuration section at the top of the file:
   - Set your Wi-Fi SSID and password
   - Set your laptop's IP address as the server URL (NOT localhost)
6. Select your ESP32 board: `Tools → Board → ESP32 Arduino → ESP32 Dev Module`
7. Upload the sketch

## Finding Your Laptop IP

**Windows:**
```
ipconfig
```
Look for "IPv4 Address" under your Wi-Fi adapter.

**macOS:**
```
ifconfig | grep "inet "
```

**Linux:**
```
hostname -I
```

Use this IP in the `SERVER_URL` configuration, e.g.:
```
const char* SERVER_URL = "http://192.168.1.100:5000";
```

## Important Notes

- **Do NOT use localhost** — on the ESP32, localhost refers to the ESP32 itself
- The ESP32 and your laptop must be on the **same Wi-Fi network**
- The backend must be running and listening on `0.0.0.0` (not just localhost)
- The device ID must match what the backend expects (default: `ESP32_WATER_01`)

## Serial Monitor

Open the Serial Monitor at 115200 baud to see:
- Wi-Fi connection status
- Sensor readings
- Server communication
- Command execution

## Sensor Calibration

The sensor reading functions in this code use example calibration values. You **must** calibrate these for your actual hardware:

- `readPH()` — adjust the voltage-to-pH conversion
- `readTDS()` — adjust the voltage-to-TDS conversion
- `readTurbidity()` — adjust the voltage-to-NTU conversion
- `readTemperature()` — adjust based on your temperature sensor type
- `readFlowRate()` — adjust the pulses-per-litre constant
