import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";
import { describe, test, expect, afterEach } from "vitest";
import { type MQTTClient } from "../MQTTClient";
import { MqttProvider } from "../MqttProvider";
import { TestClient } from "./testUtils";

describe("MQTTProvider", () => {
  test("should mount once", () => {
    const client = new TestClient();
    render(
      <MqttProvider client={client as never as MQTTClient}>
        Content
      </MqttProvider>,
    );

    expect(client.mountCount).toBe(1);
  });

  test("should pass content", () => {
    const client = new TestClient();
    const { getByText } = render(
      <MqttProvider client={client as never as MQTTClient}>
        Content
      </MqttProvider>,
    );
    expect(getByText(/Content/i)).toBeInTheDocument();
  });

  test("should unmount", () => {
    const client = new TestClient();
    const { unmount } = render(
      <MqttProvider client={client as never as MQTTClient}>
        Content
      </MqttProvider>,
    );
    expect(client.mountCount).toBe(1);
    unmount();
    expect(client.mountCount).toBe(0);
  });

  afterEach(() => {
    cleanup();
  });
});
