import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MQTTClient } from "../MQTTClient";
import { useMqttState } from "../useMqttState";
import { config, createWrapper, waitForState } from "./testUtils";

describe("useMqttState", () => {
	it("should be 'connecting' when connecting to broker", async () => {
		const { result } = renderHook(() => useMqttState(), {
			wrapper: createWrapper(config.unencrypted_unauthenticated),
		});

		await waitFor(() => {
			expect(result.current).toBe("connecting");
		});
	});
	it(
		"should change to 'connected' after client has connected",
		async () => {
			const { result } = renderHook(() => useMqttState(), {
				wrapper: createWrapper(config.unencrypted_unauthenticated),
			});

			await waitFor(
				() => {
					expect(result.current).toBe("connected");
				},
				{ timeout: 2000 },
			);
		},
		{ retry: 2 },
	);
	it("should have have value of 'error' if client fails to connect", async () => {
		const { result } = renderHook(() => useMqttState(), {
			wrapper: createWrapper({ host: "BAD_HOST", timeout: 2 }),
		});
		await waitFor(
			() => {
				expect(result.current).toBe("error");
			},
			{ timeout: 5000 },
		);
	});

	it("should have have value of 'disconnected' when client disconnects", async () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);
		const { result } = renderHook(() => useMqttState(), {
			wrapper: createWrapper({}, client),
		});

		await waitForState(client, "connected", () => client.disconnect());

		await waitFor(
			() => {
				expect(result.current).toBe("disconnected");
			},
			{ timeout: 5000 },
		);
	});

	afterEach(() => cleanup());
});
