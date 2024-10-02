import ReactDOM from "react-dom/client";
import MQTT from "paho-mqtt";
import React from "react";
import App from "./App.tsx";
import "./index.css";

// import using @visualsource/react-use-paho-mqtt not ../lib
import { MQTTClient, MqttProvider } from "../lib";

const client = new MQTTClient({
  host: "test.mosquitto.org",
  useSSL: true,
  port: 8091,
  userName: "ro",
  password: "readonly",
}, MQTT.Client);

// biome-ignore lint/style/noNonNullAssertion: The element will be in the dom
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MqttProvider client={client}>
      <App />
    </MqttProvider>
  </React.StrictMode>,
);
