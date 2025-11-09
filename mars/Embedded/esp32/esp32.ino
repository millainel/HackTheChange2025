#include <HardwareSerial.h>
#include <TinyGPSPlus.h>

#define LED_PIN 33
#define BTN_PIN 32
#define Rx_GNSS_PIN 21
#define Tx_GNSS_PIN 22
#define GNSS_BAUD 9600

#define BTN_PRESSED 0


HardwareSerial GNSS_Serial(1); // using UART1
TinyGPSPlus gps;
float latest_lat;
float latest_long;
float latest_alt;
int satellites;

void setup() {
  // put your setup code here, to run once:
  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP); 

  Serial.begin(9600);
  GNSS_Serial.begin(GNSS_BAUD, SERIAL_8N1, Rx_GNSS_PIN, Tx_GNSS_PIN);

}

void loop() {
  // put your main code here, to run repeatedly:
  int btn_state = digitalRead(BTN_PIN);
  //Serial.println(btn_state);
  
  //delay(200);
  digitalWrite(LED_PIN, LOW);
  //delay(200);

  if(GNSS_Serial.available()) {
    while (GNSS_Serial.available()) {
      char c = GNSS_Serial.read();
      gps.encode(c);
      Serial.print(c); 
    }

  }

  if(btn_state == BTN_PRESSED) {
    // send info
  }

  if (gps.location.isUpdated()) {
    digitalWrite(LED_PIN, HIGH);

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

}
