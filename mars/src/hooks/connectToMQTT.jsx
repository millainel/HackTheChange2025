import { useEffect } from "react";
import mqtt from "mqtt";
import { MQTT_URL, MQTT_USER, MQTT_PASS, MQTT_TOPIC } from "../utils/mqttConfig.ts";

export function usePoliceFeed(onMsg) {
  useEffect(() => {
    // connect to the MQTT broker
    const client = mqtt.connect(MQTT_URL, {
      username: MQTT_USER,
      password: MQTT_PASS,
      reconnectPeriod: 1500, // retry every 1.5s if disconnected
    });

    // subscribe once connected
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe(MQTT_TOPIC, (err) => {
        if (err) console.error(" Subscribe error:", err);
        else console.log("📡 Subscribed to topic:", MQTT_TOPIC);
      });
    });

    // handle incoming messages
    client.on("message", (_, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        console.log("📩 Message received:", data);
        onMsg(data);
      } catch (err) {
        console.error("Failed to parse MQTT message:", err);
      }
    });

    // cleanup on unmount
    return () => client.end(true);
  }, [onMsg]);
}
