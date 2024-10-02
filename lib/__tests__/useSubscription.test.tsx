import { cleanup, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MQTTClient, type SubscriptionCallback } from "../MQTTClient";
import { useSubscription } from "../useSubscription";
import { config, createWrapper, waitForState } from "./testUtils";

const MESSAGE_A = "/test/message";
const MESSAGE_B = "/test/message/world";

describe("useSubscription", () => {
	it("subscription is added on connect", async () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);
		const onMessage: SubscriptionCallback = () => {};
		renderHook(
			() =>
				useSubscription(MESSAGE_A, onMessage, {
					subscribe: {
						onFailure() {
							throw new Error("Failed to subscribe");
						},
					},
				}),
			{ wrapper: createWrapper({}, client) },
		);

		await waitForState(client, "connected");

		expect(client.isSubscribed(MESSAGE_A)).toBe(true);
	});

	it("subscription is removed on unmount", async () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);

		const onMessage: SubscriptionCallback = () => {};

		function TestComponent({
			topic,
		}: React.PropsWithChildren<{ topic: string }>) {
			useSubscription(topic, onMessage, {
				subscribe: {
					onFailure() {
						throw new Error("Failed to subscribe");
					},
				},
			});
			return null;
		}

		const { rerender } = render(<TestComponent topic={MESSAGE_A} />, {
			wrapper: createWrapper({}, client),
		});

		await waitForState(client, "connected");
		expect(client.isSubscribed(MESSAGE_A), "Topic was not added").toBe(true);

		rerender(<TestComponent topic={MESSAGE_B} />);

		expect(client.isSubscribed(MESSAGE_A), "Topic A was not removed").toBe(
			false,
		);
		expect(client.isSubscribed(MESSAGE_B), "Topic B was not set").toBe(true);
	});

	it("Does not create subscription if not connected", async () => {
		const onMessage: SubscriptionCallback = () => {};
		const client = new MQTTClient(config.bad_host);
		renderHook(
			() =>
				useSubscription(MESSAGE_A, onMessage, {
					subscribe: {
						onFailure() {
							throw new Error("Failed to subscribe");
						},
					},
				}),
			{ wrapper: createWrapper({}, client) },
		);

		await waitForState(client, "error");

		expect(client.isSubscribed(MESSAGE_A)).toBeFalsy();
	});

	afterEach(() => cleanup());
});
