#define LED_PIN 33
#define BTN_PIN 32

void setup() {
  // put your setup code here, to run once:
  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP); 

}

void loop() {
  // put your main code here, to run repeatedly:
  int btn_state = digitalRead(BTN_PIN);
  Serial.println(btn_state);
  digitalWrite(LED_PIN, HIGH);
  delay(2000);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}
