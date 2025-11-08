import React, { useState } from "react";
import { usePoliceFeed } from "../hooks/connectToMQTT";

export default function TestFeed() {
  const [messages, setMessages] = useState([]);

  // use the hook
  usePoliceFeed((msg) => {
    console.log(" Received:", msg);
    setMessages((prev) => [...prev, msg]);
  });

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h2>MQTT Test Feed</h2>
      <p>Listening for messages from HiveMQ...</p>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>
            {JSON.stringify(m)}
          </li>
        ))}
      </ul>
    </div>
  );
}
