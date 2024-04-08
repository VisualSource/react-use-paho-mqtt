import { describe, it, expect, afterEach } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { config, createWrapper } from "./testUtils";
import { MQTTClient } from "../MQTTClient";
import { useMqtt } from "../useMqtt";

describe("useMqtt", () => {
  it("should return instance of the client", () => {
    const client = new MQTTClient(config.unencrypted_unauthenticated);
    const { result } = renderHook(() => useMqtt(), {
      wrapper: createWrapper({}, client),
    });

    expect(result.current).toBe(client);
    expect(result.current).toBeInstanceOf(MQTTClient);
  });

  afterEach(() => cleanup());
});
