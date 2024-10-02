import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MQTTClient } from "../MQTTClient";
import { useMqtt } from "../useMqtt";
import { config, createWrapper, makeClient } from "./testUtils";

describe("useMqtt", () => {
	it("should return instance of the client", () => {
		const client = makeClient(config.unencrypted_unauthenticated);
		const { result } = renderHook(() => useMqtt(), {
			wrapper: createWrapper({}, client),
		});

		expect(result.current).toBe(client);
		expect(result.current).toBeInstanceOf(MQTTClient);
	});

	afterEach(() => cleanup());
});
