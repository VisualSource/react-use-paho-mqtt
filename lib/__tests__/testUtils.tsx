import {
  MQTTClient,
  MQTTClientOptions,
  Status,
  StatusEvent,
} from "../MQTTClient";
import { MqttProvider } from "../MqttProvider";

export class TestClient {
  #mountCount: number = 0;
  mount() {
    this.#mountCount++;
    if (this.#mountCount !== 1) return;
  }
  unmount() {
    this.#mountCount--;
    if (this.#mountCount !== 0) return;
  }
  get mountCount() {
    return this.#mountCount;
  }
}

export const config = {
  bad_host: {
    host: "BAD_HOST",
    clientId: "TEST_CLIENT",
    path: "/mqtt",
  } as MQTTClientOptions,
  unencrypted_unauthenticated: {
    host: "test.mosquitto.org",
    port: 8080,
    clientId: "TEST_CLIENT",
    path: "/mqtt",
  } as MQTTClientOptions,
  encrypted_unauthenticated: {
    host: "test.mosquitto.org",
    port: 8081,
    clientId: "TEST_CLIENT",
    path: "/mqtt",
  } as MQTTClientOptions,
  unencrypted_authenticated: {
    host: "test.mosquitto.org",
    port: 8090,
    userName: "ro",
    password: "readonly",
    clientId: "TEST_CLIENT",
    path: "/mqtt",
  } as MQTTClientOptions,
  encrypted_authenticated: {
    host: "test.mosquitto.org",
    port: 8091,
    userName: "ro",
    password: "readonly",
    clientId: "TEST_CLIENT",
    path: "/mqtt",
  } as MQTTClientOptions,
};

export function wait(timeout: number) {
  return new Promise<void>((ok) => setTimeout(() => ok(), timeout));
}

export function waitForState(
  client: MQTTClient,
  state: Status,
  action?: (state: Status) => void,
) {
  return new Promise<void>((ok, reject) => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    const callback = (ev: Event) => {
      if ((ev as StatusEvent).detail.type === state) {
        clearTimeout(timeout);
        action?.call(undefined, (ev as StatusEvent).detail.type);
        ok();
      }
    };
    timeout = setTimeout(() => {
      client.removeEventListener("state", callback);
      reject("Client state change took too long.");
    }, 5000);

    client.addEventListener("state", callback, { once: true });
  });
}

export const createWrapper = (
  options: MQTTClientOptions,
  client?: MQTTClient,
) => {
  const c = client ? client : new MQTTClient(options);
  return ({ children }: React.PropsWithChildren) => (
    <MqttProvider client={c}>{children}</MqttProvider>
  );
};
