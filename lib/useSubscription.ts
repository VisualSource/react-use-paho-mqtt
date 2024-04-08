import { useEffect } from "react";
import MQTT from "paho-mqtt";
import type { SubscriptionCallback, Unsubscribe } from "./MQTTClient";
import { useMqttState } from "./useMqttState";
import { useMqtt } from "./useMqtt";

type Options = {
  subscribe?: MQTT.SubscribeOptions;
  unsubscribe?: MQTT.UnsubscribeOptions;
};

/**
 * React hook for subscribing to messages, request receipt of a copy of messages sent to the destinations described by the filter.
 * @param topic
 * @param callback
 */
export const useSubscription = (
  topic: string,
  callback: SubscriptionCallback,
  opt?: Options,
) => {
  const state = useMqttState();
  const mqtt = useMqtt();

  useEffect(() => {
    let unsub: Unsubscribe | undefined;

    if (state === "connected") {
      unsub = mqtt.subscribe(topic, callback, opt?.subscribe);
    }
    return () => {
      if (unsub) unsub(opt?.unsubscribe);
    };
  }, [topic, callback, mqtt, state, opt]);
};
