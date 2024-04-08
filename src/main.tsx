import ReactDOM from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";

import { MQTTClient, MqttProvider } from "../lib";

const client = new MQTTClient({
  host: "test.mosquitto.org",
  useSSL: true,
  port: 8091,
  userName: "ro",
  password: "readonly",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MqttProvider client={client}>
      <App />
    </MqttProvider>
  </React.StrictMode>,
);
