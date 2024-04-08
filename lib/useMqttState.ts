import { useCallback, useSyncExternalStore } from "react";
import { useMqtt } from "./useMqtt";

/**
 * Returns that current state of the mqtt client
 * @returns
 */
export const useMqttState = () => {
  const mqtt = useMqtt();
  const sub = useCallback(
    (callback: () => void) => {
      mqtt.addEventListener("state", callback);
      return () => {
        mqtt.removeEventListener("state", callback);
      };
    },
    [mqtt],
  );
  return useSyncExternalStore(sub, () => mqtt.getStatus());
};
