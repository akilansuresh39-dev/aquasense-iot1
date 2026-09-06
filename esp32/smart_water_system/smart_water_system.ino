/**
 * Smart Water Purification & Quality Monitoring System
 * ESP32 Firmware
 *
 * This code runs on the ESP32 and:
 * 1. Connects to Wi-Fi
 * 2. Reads sensor values (pH, TDS, Turbidity, Temperature, Flow)
 * 3. Sends data to the backend via HTTP POST
 * 4. Polls for control commands from the backend
 * 5. Executes received commands (pump, solenoid, UV)
 * 6. Reports updated status back to the backend
 *
 * IMPORTANT: Do NOT use "localhost" or "127.0.0.1" for the server URL.
 * The ESP32's localhost refers to itself. Use your laptop's local IP,
 * for example: http://192.168.1.100:5000
 *
 * Wi-Fi: The ESP32 and your laptop must be on the same network.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION — Update these values for your setup
// ═══════════════════════════════════════════════════════════════════════

// Your Wi-Fi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // ← Change this
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // ← Change this

// Backend server URL — use your LAPTOP'S local IP address
// Find your laptop IP: Windows: ipconfig | macOS/Linux: ifconfig
const char* SERVER_URL = "http://192.168.1.100:5000"; // ← Change this

// Device identifier — must match the backend configuration
const char* DEVICE_ID = "ESP32_WATER_01";

// ═══════════════════════════════════════════════════════════════════════
// TIMING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

// How often to send sensor data (milliseconds)
const unsigned long SEND_INTERVAL = 5000;  // 5 seconds

// How often to check for commands (milliseconds)
const unsigned long COMMAND_CHECK_INTERVAL = 2000;  // 2 seconds

// Wi-Fi reconnect interval (milliseconds)
const unsigned long WIFI_RECONNECT_INTERVAL = 10000;  // 10 seconds

// ═══════════════════════════════════════════════════════════════════════
// PIN DEFINITIONS — Update these for your hardware wiring
// ═══════════════════════════════════════════════════════════════════════

// Analog sensor pins
const int PH_PIN = 36;          // pH sensor (ADC1_CH0)
const int TDS_PIN = 39;         // TDS sensor (ADC1_CH3)
const int TURBIDITY_PIN = 34;   // Turbidity sensor (ADC1_CH6)
const int TEMP_PIN = 35;        // Temperature sensor (ADC1_CH7)
const int FLOW_PIN = 25;        // Flow sensor (pulse counter)

// Digital control pins
const int PUMP_PIN = 16;        // Water pump relay
const int SOLENOID_PIN = 17;    // Solenoid valve relay
const int UV_PIN = 18;          // UV disinfection relay

// ═══════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════

// Timing variables (non-blocking using millis())
unsigned long lastSendTime = 0;
unsigned long lastCommandCheck = 0;
unsigned long lastWifiReconnect = 0;

// Device state
bool pumpActive = true;
bool solenoidActive = true;
bool uvActive = true;

// Flow sensor
volatile unsigned long flowPulseCount = 0;
float flowRate = 0.0;

// ═══════════════════════════════════════════════════════════════════════
// SENSOR READING FUNCTIONS (modular — replace with actual sensor code)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Read pH value from the pH sensor.
 * Replace this function body with your actual pH sensor code.
 * Common pH sensors output an analog voltage proportional to pH.
 */
float readPH() {
  // Read analog value and convert to pH (0-14 range)
  int raw = analogRead(PH_PIN);
  float voltage = (raw / 4095.0) * 3.3;  // ESP32 ADC: 12-bit, 3.3V ref
  // Calibration: adjust these values for your specific sensor
  float ph = 7.0 + ((2.5 - voltage) / 0.18);  // Example calibration
  return constrain(ph, 0.0, 14.0);
}

/**
 * Read TDS (Total Dissolved Solids) value in ppm.
 * Replace this function body with your actual TDS sensor code.
 */
float readTDS() {
  int raw = analogRead(TDS_PIN);
  float voltage = (raw / 4095.0) * 3.3;
  // TDS conversion (example calibration)
  float tds = voltage * 500.0;  // Adjust for your sensor
  return constrain(tds, 0.0, 5000.0);
}

/**
 * Read Turbidity value in NTU.
 * Replace this function body with your actual turbidity sensor code.
 */
float readTurbidity() {
  int raw = analogRead(TURBIDITY_PIN);
  float voltage = (raw / 4095.0) * 3.3;
  // Turbidity conversion (example calibration)
  float turbidity = (voltage / 3.3) * 100.0;  // NTU
  return constrain(turbidity, 0.0, 100.0);
}

/**
 * Read temperature in °C.
 * Replace this function body with your actual temperature sensor code.
 */
float readTemperature() {
  int raw = analogRead(TEMP_PIN);
  float voltage = (raw / 4095.0) * 3.3;
  // Temperature conversion (LM35 example: 10mV/°C)
  float temp = voltage * 100.0;
  return constrain(temp, -10.0, 60.0);
}

/**
 * Read water flow rate in L/min.
 * Uses interrupt-based pulse counting for accuracy.
 */
float readFlowRate() {
  noInterrupts();
  unsigned long pulses = flowPulseCount;
  flowPulseCount = 0;
  interrupts();

  // Convert pulses to L/min (calibrate for your flow sensor)
  // Common flow sensors: ~450 pulses per litre
  flowRate = (pulses / 450.0) * (60.0 / (SEND_INTERVAL / 1000.0));
  return flowRate;
}

// Flow sensor interrupt handler
void IRAM_ATTR flowPulseISR() {
  flowPulseCount++;
}

// ═══════════════════════════════════════════════════════════════════════
// DEVICE CONTROL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

void setPump(bool state) {
  pumpActive = state;
  digitalWrite(PUMP_PIN, state ? HIGH : LOW);
  Serial.printf("[CONTROL] Pump: %s\n", state ? "ON" : "OFF");
}

void setSolenoid(bool state) {
  solenoidActive = state;
  digitalWrite(SOLENOID_PIN, state ? HIGH : LOW);
  Serial.printf("[CONTROL] Solenoid: %s\n", state ? "OPEN" : "CLOSED");
}

void setUV(bool state) {
  uvActive = state;
  digitalWrite(UV_PIN, state ? HIGH : LOW);
  Serial.printf("[CONTROL] UV: %s\n", state ? "ON" : "OFF");
}

// ═══════════════════════════════════════════════════════════════════════
// WI-FI MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

void connectWiFi() {
  Serial.printf("[WIFI] Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WIFI] Connection failed. Will retry...");
  }
}

void ensureWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long now = millis();
    if (now - lastWifiReconnect >= WIFI_RECONNECT_INTERVAL) {
      lastWifiReconnect = now;
      Serial.println("[WIFI] Reconnecting...");
      connectWiFi();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// BACKEND COMMUNICATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Send sensor data to the backend via HTTP POST.
 * Creates a JSON payload with all sensor readings and device status.
 */
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) return;

  // Read all sensors
  float ph = readPH();
  float tds = readTDS();
  float turbidity = readTurbidity();
  float temperature = readTemperature();
  float flow = readFlowRate();

  // Log to Serial
  Serial.printf("[DATA] pH=%.2f TDS=%.0fppm Turb=%.2fNTU Temp=%.1fC Flow=%.1fL/min\n",
                ph, tds, turbidity, temperature, flow);

  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["ph"] = round(ph * 100.0) / 100.0;
  doc["tds"] = round(tds);
  doc["turbidity"] = round(turbidity * 100.0) / 100.0;
  doc["temperature"] = round(temperature * 10.0) / 10.0;
  doc["flowRate"] = round(flow * 10.0) / 10.0;
  doc["pump"] = pumpActive;
  doc["solenoid"] = solenoidActive;
  doc["uv"] = uvActive;

  String jsonString;
  serializeJson(doc, jsonString);

  // Send HTTP POST request
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/device/data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("[DATA] Server response: %d - %s\n", httpResponseCode, response.c_str());
  } else {
    Serial.printf("[DATA] HTTP error: %d\n", httpResponseCode);
  }

  http.end();
}

/**
 * Poll the backend for pending control commands.
 * The backend queues commands from the web dashboard.
 */
void checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/device/commands/" + DEVICE_ID;
  http.begin(url);

  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    String response = http.getString();

    // Parse the response
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error && doc.containsKey("command")) {
      const char* command = doc["command"];

      if (command != nullptr && strlen(command) > 0) {
        Serial.printf("[CMD] Received command: %s\n", command);

        // Execute the command
        String cmd = String(command);
        if (cmd == "pump_on") setPump(true);
        else if (cmd == "pump_off") setPump(false);
        else if (cmd == "solenoid_open") setSolenoid(true);
        else if (cmd == "solenoid_close") setSolenoid(false);
        else if (cmd == "uv_on") setUV(true);
        else if (cmd == "uv_off") setUV(false);
        else Serial.printf("[CMD] Unknown command: %s\n", command);
      }
    }
  }

  http.end();
}

// ═══════════════════════════════════════════════════════════════════════
// SETUP & MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n=================================");
  Serial.println(" Smart Water IoT System Starting");
  Serial.println("=================================\n");

  // Configure control pins as outputs
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(SOLENOID_PIN, OUTPUT);
  pinMode(UV_PIN, OUTPUT);

  // Configure sensor pins as inputs
  pinMode(PH_PIN, INPUT);
  pinMode(TDS_PIN, INPUT);
  pinMode(TURBIDITY_PIN, INPUT);
  pinMode(TEMP_PIN, INPUT);
  pinMode(FLOW_PIN, INPUT_PULLUP);

  // Attach flow sensor interrupt
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), flowPulseISR, RISING);

  // Set initial device states
  setPump(true);
  setSolenoid(true);
  setUV(true);

  // Connect to Wi-Fi
  connectWiFi();

  Serial.println("[SYSTEM] Setup complete. Starting main loop.\n");
}

/**
 * Main loop — uses non-blocking timing with millis().
 * Runs continuously and checks intervals for each task.
 */
void loop() {
  unsigned long now = millis();

  // Ensure Wi-Fi is connected
  ensureWiFi();

  // Send sensor data at regular intervals
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;
    sendSensorData();
  }

  // Check for commands at regular intervals
  if (now - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
    lastCommandCheck = now;
    checkForCommands();
  }

  // Small yield to prevent watchdog timeout
  yield();
}
