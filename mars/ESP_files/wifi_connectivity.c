#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>

#define LED_PIN 33
#define BTN_PIN 32
#define Rx_GNSS_PIN 21
#define Tx_GNSS_PIN 22
#define GNSS_BAUD 9600

#define BTN_PRESSED 0

int btn_pressed = 0;

// ---------- Wi-Fi ----------
const char* WIFI_SSID = "bananawifi";
const char* WIFI_PASS = "wifibox!";

// ---------- HiveMQ Cloud ----------
const char* MQTT_HOST = "fb3b51b4db3e43e9982b333f87d8b8b5.s1.eu.hivemq.cloud";
const int MQTT_PORT = 8883;   // this is the secure MQTT port (TLS)                
const char* MQTT_USER = "hivemq.webclient.1762633343139";
const char* MQTT_PASS = ".ji%3*0$1T2AZgYQfsRe";
const char* MQTT_TOPIC = "hack/police/esp32-01";     // match your React/app topic

HardwareSerial GNSS_Serial(1); // using UART1
TinyGPSPlus gps;
float latest_lat;
float latest_long;
float latest_alt;
int satellites;


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
    pinMode(LED_PIN, OUTPUT);
    pinMode(BTN_PIN, INPUT_PULLUP); 
  
    Serial.begin(GNSS_BAUD);
    GNSS_Serial.begin(GNSS_BAUD, SERIAL_8N1, Rx_GNSS_PIN, Tx_GNSS_PIN);

    attachInterrupt(BTN_PIN, isr, FALLING); // interrupt when go from 1 to 0 

    delay(100);

  // Wi-Fi
    Serial.printf("Connecting to Wi-Fi SSID: %s\n", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) { 
        Serial.print("."); 
        delay(400); 
    }
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

  int btn_state = digitalRead(BTN_PIN); 
  digitalWrite(LED_PIN, LOW);
  if(GNSS_Serial.available()) {
    while (GNSS_Serial.available()) {
      char c = GNSS_Serial.read();
      gps.encode(c);
      Serial.print(c); 
    }

  }
  if (gps.location.isUpdated()) {
    //digitalWrite(LED_PIN, HIGH);

    latest_lat = gps.location.lat();
    latest_long = gps.location.lng();
    latest_alt = gps.altitude.meters();
    satellites = gps.satellites.value();

    Serial.print("Latitude: ");
    Serial.println(gps.location.lat());

    Serial.print("Longiutde: ");
    Serial.println(gps.location.lng());

    Serial.print("Altitude (m): ");
    Serial.println(gps.altitude.meters());

    Serial.print("Satellites: ");
    Serial.print(gps.satellites.value());


  }
  if(btn_pressed == 1) {
    digitalWrite(LED_PIN, HIGH);
    char payload[256];
    snprintf(payload, sizeof(payload),
        "{\"lat\":%.6f,\"lng\":%.6f,\"alt\":%.2f,\"sats\":%u}",
        latest_lat, latest_long, latest_alt, satellites);

      bool ok = mqtt.publish(MQTT_TOPIC, payload);
      Serial.println(ok ? String("Published: ") + payload : "Publish failed");
      
      btn_pressed = 0;
  }
  
  // change this to only a button press keep it loop for now because of testing
  
  }


void IRAM_ATTR isr() {
  btn_pressed = 1;
}