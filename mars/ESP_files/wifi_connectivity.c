#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// ---------- Wi-Fi ----------
const char* WIFI_SSID = "bananawifi";
const char* WIFI_PASS = "wifibox!";

// ---------- HiveMQ Cloud ----------
const char* MQTT_HOST = "fb3b51b4db3e43e9982b333f87d8b8b5.s1.eu.hivemq.cloud";
const int MQTT_PORT = 8883;   // this is the secure MQTT port (TLS)                
const char* MQTT_USER = "hivemq.webclient.1762633343139";
const char* MQTT_PASS = ".ji%3*0$1T2AZgYQfsRe";
const char* MQTT_TOPIC = "hack/police/esp32-01";     // match your React/app topic

// ---------- Clients ----------
WiFiClientSecure net;
PubSubClient mqtt(net);

void ensureMqtt() {
  while (!mqtt.connected()) {
    String cid = "c3-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    Serial.print("Connecting to MQTT as "); Serial.println(cid);
    if (mqtt.connect(cid.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println("MQTT connected ");
    } else {
      Serial.print("MQTT connect failed, rc="); Serial.println(mqtt.state());
      delay(1500);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);

  // Wi-Fi
  Serial.printf("Connecting to Wi-Fi SSID: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { Serial.print("."); delay(400); }
  Serial.printf("\nWi-Fi connected  IP: %s\n", WiFi.localIP().toString().c_str());

  // TLS (hackathon shortcut). For strict TLS, load a CA with net.setCACert(...)
  net.setInsecure();

  // MQTT
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi dropped, reconnecting...");
    WiFi.reconnect();
    delay(1000);
    return;
  }

  if (!mqtt.connected()) ensureMqtt();
  mqtt.loop();

  static uint32_t last = 0;
  if (millis() - last > 5000) { // publish every 5s
    last = millis();
    char payload[128];
    snprintf(payload, sizeof(payload),
             "{\"event\":\"hello\",\"ts_ms\":%lu}", (unsigned long)millis());

    bool ok = mqtt.publish(MQTT_TOPIC, payload);
    Serial.println(ok ? String("Published: ") + payload : "Publish failed");
  }
}
