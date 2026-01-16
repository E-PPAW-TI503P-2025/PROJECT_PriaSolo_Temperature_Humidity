#include <dummy.h>

/**
 * ============================================
 * IoT Temperature & Humidity Monitoring System
 * ESP32 + DHT11 Sensor Code
 * ============================================
 * 
 * This code reads temperature and humidity from DHT11 sensor
 * and sends data to the backend server via HTTP POST.
 * 
 * Hardware Required:
 * - ESP32 Development Board
 * - DHT11 Temperature & Humidity Sensor
 * - Buzzer (optional, for high temperature alert)
 * - LED (optional, for status indication)
 * 
 * Wiring:
 * - DHT11 Data Pin -> GPIO 4
 * - Buzzer -> GPIO 5
 * - LED -> GPIO 2 (built-in LED)
 * 
 * Libraries Required:
 * - WiFi.h (built-in)
 * - HTTPClient.h (built-in)
 * - DHT.h (Adafruit DHT Sensor Library)
 * - ArduinoJson.h (ArduinoJson by Benoit Blanchon)
 * 
 * Install libraries via Arduino IDE Library Manager
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ============================================
// Configuration - EDIT THESE VALUES
// ============================================

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";      // Ganti dengan SSID WiFi Anda
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Ganti dengan password WiFi

// Server Configuration
const char* SERVER_URL = "http://YOUR_SERVER_IP:3000/api/iot/data"; // Ganti dengan IP server Anda
const char* DEVICE_CODE = "ESP32-001"; // Kode unik device (harus terdaftar di database)

// Sensor Configuration
#define DHT_PIN 4           // GPIO pin untuk DHT11 data
#define DHT_TYPE DHT11      // Tipe sensor (DHT11 atau DHT22)

// Buzzer & LED Configuration
#define BUZZER_PIN 5        // GPIO pin untuk buzzer
#define LED_PIN 2           // GPIO pin untuk LED (built-in LED)

// Timing Configuration
const unsigned long SEND_INTERVAL = 10000; // Interval kirim data (10 detik)
const float TEMP_THRESHOLD = 30.0;         // Threshold suhu untuk buzzer alert

// ============================================
// Global Variables
// ============================================

DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastSendTime = 0;
int failedAttempts = 0;
const int MAX_RETRIES = 3;

// ============================================
// Setup Function
// ============================================

void setup() {
    // Initialize Serial
    Serial.begin(115200);
    delay(1000);
    
    Serial.println();
    Serial.println("╔══════════════════════════════════════════╗");
    Serial.println("║   IoT Temperature & Humidity Monitor     ║");
    Serial.println("║   ESP32 + DHT11                          ║");
    Serial.println("╚══════════════════════════════════════════╝");
    Serial.println();
    
    // Initialize GPIO
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    
    // Turn off buzzer initially
    digitalWrite(BUZZER_PIN, LOW);
    
    // Blink LED to indicate startup
    blinkLED(3, 200);
    
    // Initialize DHT sensor
    Serial.println("📡 Initializing DHT11 sensor...");
    dht.begin();
    delay(2000); // Wait for sensor to stabilize
    
    // Connect to WiFi
    connectWiFi();
    
    Serial.println();
    Serial.println("✅ System ready! Starting monitoring...");
    Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

// ============================================
// Main Loop
// ============================================

void loop() {
    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("⚠️ WiFi disconnected! Reconnecting...");
        connectWiFi();
    }
    
    // Check if it's time to send data
    unsigned long currentTime = millis();
    if (currentTime - lastSendTime >= SEND_INTERVAL) {
        lastSendTime = currentTime;
        
        // Read sensor data
        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();
        
        // Validate sensor readings
        if (isnan(temperature) || isnan(humidity)) {
            Serial.println("❌ Failed to read from DHT sensor!");
            blinkLED(5, 100); // Fast blink to indicate error
            return;
        }
        
        // Print readings to Serial
        printReadings(temperature, humidity);
        
        // Check temperature threshold and trigger alarm
        if (temperature > TEMP_THRESHOLD) {
            triggerAlarm(temperature);
        } else {
            digitalWrite(BUZZER_PIN, LOW);
        }
        
        // Send data to server
        sendDataToServer(temperature, humidity);
    }
    
    // Small delay to prevent CPU hogging
    delay(100);
}

// ============================================
// WiFi Connection Function
// ============================================

void connectWiFi() {
    Serial.print("🔗 Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // Toggle LED while connecting
        attempts++;
    }
    
    Serial.println();
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("✅ WiFi connected!");
        Serial.print("   IP Address: ");
        Serial.println(WiFi.localIP());
        Serial.print("   Signal Strength (RSSI): ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
        
        digitalWrite(LED_PIN, HIGH); // LED on when connected
    } else {
        Serial.println("❌ WiFi connection failed!");
        Serial.println("   Please check SSID and password.");
        
        // Blink rapidly to indicate connection failure
        blinkLED(10, 100);
    }
}

// ============================================
// Send Data to Server
// ============================================

void sendDataToServer(float temperature, float humidity) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("❌ Cannot send data - WiFi not connected");
        return;
    }
    
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000); // 10 second timeout
    
    // Create JSON payload
    StaticJsonDocument<256> doc;
    doc["device_code"] = DEVICE_CODE;
    doc["suhu"] = round(temperature * 10) / 10.0; // Round to 1 decimal
    doc["kelembaban"] = round(humidity * 10) / 10.0;
    
    // Add light sensor value if available (set to null for now)
    // You can connect a light sensor (LDR) and add readings here
    // doc["cahaya"] = analogRead(LDR_PIN);
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    Serial.print("📤 Sending to server: ");
    Serial.println(jsonPayload);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.print("📥 Response (");
        Serial.print(httpResponseCode);
        Serial.print("): ");
        Serial.println(response);
        
        if (httpResponseCode == 200 || httpResponseCode == 201) {
            Serial.println("✅ Data sent successfully!");
            failedAttempts = 0;
            blinkLED(1, 100); // Short blink on success
        } else {
            Serial.println("⚠️ Server returned error");
            failedAttempts++;
        }
    } else {
        Serial.print("❌ HTTP Error: ");
        Serial.println(httpResponseCode);
        Serial.println("   Check server URL and connection");
        failedAttempts++;
    }
    
    http.end();
    
    // If too many failures, reset WiFi connection
    if (failedAttempts >= MAX_RETRIES) {
        Serial.println("⚠️ Too many failures, reconnecting WiFi...");
        WiFi.disconnect();
        delay(1000);
        connectWiFi();
        failedAttempts = 0;
    }
}

// ============================================
// Print Readings to Serial
// ============================================

void printReadings(float temperature, float humidity) {
    Serial.println();
    Serial.println("┌────────────────────────────────────────┐");
    Serial.print("│ 🌡️ Temperature: ");
    Serial.print(temperature, 1);
    Serial.print(" °C");
    
    // Add spacing
    if (temperature < 10) Serial.print("  ");
    else if (temperature < 100) Serial.print(" ");
    
    // Status indicator
    if (temperature > TEMP_THRESHOLD) {
        Serial.println("     ⚠️ HIGH! │");
    } else {
        Serial.println("     ✅ OK    │");
    }
    
    Serial.print("│ 💧 Humidity:    ");
    Serial.print(humidity, 1);
    Serial.print(" %");
    
    // Add spacing
    if (humidity < 10) Serial.print("  ");
    else if (humidity < 100) Serial.print(" ");
    
    Serial.println("     ✅ OK    │");
    Serial.println("└────────────────────────────────────────┘");
}

// ============================================
// Trigger Alarm (Buzzer)
// ============================================

void triggerAlarm(float temperature) {
    Serial.println("🚨 ALERT: High temperature detected!");
    Serial.print("   Current: ");
    Serial.print(temperature, 1);
    Serial.print("°C | Threshold: ");
    Serial.print(TEMP_THRESHOLD, 1);
    Serial.println("°C");
    
    // Beep pattern for alert
    for (int i = 0; i < 3; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(100);
        digitalWrite(BUZZER_PIN, LOW);
        delay(100);
    }
}

// ============================================
// Blink LED Helper Function
// ============================================

void blinkLED(int times, int delayMs) {
    for (int i = 0; i < times; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(delayMs);
        digitalWrite(LED_PIN, LOW);
        delay(delayMs);
    }
}

// ============================================
// Optional: Add Light Sensor Reading
// ============================================
/*
 * To add a light sensor (LDR), connect it to an analog pin (e.g., GPIO 34)
 * 
 * Wiring:
 * - LDR one leg -> 3.3V
 * - LDR other leg -> 10K resistor -> GND
 * - Junction between LDR and resistor -> GPIO 34
 * 
 * Code:
 * #define LDR_PIN 34
 * int lightValue = analogRead(LDR_PIN);
 * doc["cahaya"] = lightValue;
 */
