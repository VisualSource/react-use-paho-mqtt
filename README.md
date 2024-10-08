# React use Paho Mqtt

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

React Wrapper for the the javascript [Paho MQTT library](https://www.npmjs.com/package/paho-mqtt)

## Installation

Install react-use-paho-mqtt

#### NPM

```bash
  npm install @visualsource/react-use-paho-mqtt paho-mqtt
  npm install @types/paho-mqtt -D
```

#### PNPM

```bash
  pnpm add @visualsource/react-use-paho-mqtt paho-mqtt 
  pnpm add @types/paho-mqtt -D
```

## Usage/Examples

### Paho MQTT Example

Make sure to install the paho-mqtt library

#### NPM

```bash
  npm install paho-mqtt
  npm install @types/paho-mqtt -D
```

#### PNPM

```bash
  pnpm add paho-mqtt 
  pnpm add @types/paho-mqtt -D
```

```tsx
// main.tsx
import MQTT from "paho-mqtt";
import { MQTTClient, MqttProvider } from "@visualsource/react-use-paho-mqtt";

const client = new MQTTClient({
  host: "test.mosquitto.org",
  useSSL: true,
  port: 8091,
  userName: "ro",
  password: "readonly",
},MQTT.Client);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MqttProvider client={client}>
      <App />
    </MqttProvider>
  </React.StrictMode>
);

// App.tsx
import {
  useSubscription,
  useMqtt,
  type MessageEvent,
} from "@visualsource/react-use-paho-mqtt";

function App() {
  const mqtt = useMqtt();
  const onMessage = useCallback((ev: MessageEvent) => {
    const { payloadString, destinationName } = ev.detail;
    console.log(`Topic ${destinationName}, Payload: ${payloadString}`)
  },[]);

  useSubscription("/message/example", onMessage);

  return (
    <button
      onClick={() => {
        mqtt.publish("/message/example", "Payload");
      }}
    >
      Btn
    </button>
  );
}
```

### Custom MQTT Client Eample

```tsx
// main.tsx
import { MQTTClient, MqttProvider, type IClient } from "@visualsource/react-use-paho-mqtt";

class MQTTClientImplemention implements IClient {
  // implement required methods and properties
  // See documention for details.
}

const client = new MQTTClient({
  host: "test.mosquitto.org",
  useSSL: true,
  port: 8091,
  userName: "ro",
  password: "readonly",
},MQTTClientImplemention);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MqttProvider client={client}>
      <App />
    </MqttProvider>
  </React.StrictMode>
);

// App.tsx
import {
  useSubscription,
  useMqtt,
  type MessageEvent,
} from "@visualsource/react-use-paho-mqtt";

function App() {
  const mqtt = useMqtt();
  const onMessage = useCallback((ev: MessageEvent) => {
    const { payloadString, destinationName } = ev.detail;
    console.log(`Topic ${destinationName}, Payload: ${payloadString}`)
  },[]);

  useSubscription("/message/example", onMessage);

  return (
    <button
      onClick={() => {
        mqtt.publish("/message/example", "Payload");
      }}
    >
      Btn
    </button>
  );
}
```

## Documentation

[Documentation](https://visualsource.github.io/react-use-paho-mqtt/docs)

## Demo

[Demo](https://visualsource.github.io/react-use-paho-mqtt/demo)

## Run Example Locally

Clone the project

```bash
  git clone https://github.com/VisualSource/react-use-paho-mqtt
```

Go to the project directory

```bash
  cd react-use-paho-mqtt
```

```bash
  pnpm install
```

```bash
  pnpm build
```

```bash
  pnpm preview
```

## Running Tests

To run tests, run the following command

```bash
  pnpm test
```

## Authors

- [@VisualSource](https://www.github.com/visualsource)

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgements

- [Test Mosquitto Broker](https://test.mosquitto.org/)
- [Core MQTT Library](https://www.npmjs.com/package/paho-mqtt)
- [mqtt-pattern](https://www.npmjs.com/package/mqtt-pattern)
