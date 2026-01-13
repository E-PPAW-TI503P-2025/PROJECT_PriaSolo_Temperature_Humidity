#include "DHT.h"

#define DHTPIN 4        // DATA DHT11
#define DHTTYPE DHT11  // Tipe sensor
#define BUZZER_PIN 19  // Buzzer

DHT dht(DHTPIN, DHTTYPE);

float batasSuhu = 35.0; // Suhu batas buzzer (°C)

void setup() {
  Serial.begin(115200);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  dht.begin();

  Serial.println("=== Sistem Monitoring Suhu DHT11 ===");
}

void loop() {
  float suhu = dht.readTemperature(); // Celsius

  if (isnan(suhu)) {
    Serial.println("GAGAL BACA SENSOR DHT!");
    delay(3000);
    return;
  }

  Serial.print("Suhu: ");
  Serial.print(suhu);
  Serial.println(" °C");

  if (suhu >= batasSuhu) {
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("⚠️ Buzzer ON (Suhu Tinggi)");
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  delay(3000); // DHT tidak boleh dibaca terlalu cepat
}
