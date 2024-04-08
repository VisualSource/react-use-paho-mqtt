import { createContext } from "react";
import type { MQTTClient } from "./MQTTClient";
export const mqttContext = createContext<MQTTClient | null>(null);
