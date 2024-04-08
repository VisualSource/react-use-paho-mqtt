import { useState, useCallback, useRef } from "react";
import { useSubscription, useMqtt, MessageEvent } from "../lib";
import "./App.css";

function App() {
  const container = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ message: string; time: string }[]>(
    [],
  );
  const mqtt = useMqtt();

  const onMessage = useCallback((ev: MessageEvent) => {
    const { payloadString } = ev.detail;
    setMessages((prev) => [
      ...prev,
      { message: payloadString, time: new Date().toLocaleTimeString() },
    ]);
    if (container.current) {
      container.current.scroll({
        behavior: "smooth",
        top: container.current.scrollHeight,
      });
    }
  }, []);

  useSubscription("/message/example", onMessage);

  return (
    <>
      <h1>react-use-mqtt Demo</h1>

      <section className="message-box" ref={container}>
        {messages.map((value, i) => (
          <div key={i}>
            <span>{value.time}: </span>
            {value.message}
          </div>
        ))}
      </section>

      <div className="input-form-container">
        <form
          className="input-form"
          onSubmit={(ev) => {
            ev.preventDefault();
            const data = new FormData(ev.target as HTMLFormElement);
            const message = data.get("message")?.toString();
            if (!message) return;
            mqtt.publish("/message/example", message);
          }}
        >
          <input placeholder="Message" name="message" />
          <button type="submit">Send</button>
        </form>
      </div>
      <a href="https://test.mosquitto.org/">https://test.mosquitto.org/</a>
    </>
  );
}

export default App;
