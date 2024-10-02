import { describe, expect, it } from "vitest";
import { MQTTClient } from "../MQTTClient";
import { config, waitForState } from "./testUtils";

const MESSAGE_TOPIC = "topic/message/test";
describe("MQTTClient", () => {
	it("Connects to unencrypted authenticated broker", async () => {
		const client = new MQTTClient(config.unencrypted_authenticated);

		client.mount();

		await waitForState(client, "connected");

		expect(client.getStatus()).toBe("connected");
	});

	it("Connects to unencrypted unauthenticated broker", async () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);

		client.mount();

		await waitForState(client, "connected");

		expect(client.getStatus()).toBe("connected");
	});

	it("Connects to encrypted authenticated broker", async () => {
		const client = new MQTTClient(config.encrypted_authenticated);

		client.mount();

		await waitForState(client, "connected");

		expect(client.getStatus()).toBe("connected");
	});

	it("Connects to encrypted unauthenticated broker", async () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);

		client.mount();

		await waitForState(client, "connected");

		expect(client.getStatus()).toBe("connected");
	});

	it("returns client id", () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);
		expect(client.clientId).toBe(config.unencrypted_unauthenticated.clientId);
	});

	it("returns host", () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);
		expect(client.host).toBe(config.unencrypted_unauthenticated.host);
	});

	it("returns path", () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);
		expect(client.path).toBe(config.unencrypted_unauthenticated.path);
	});

	it("returns port", () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);
		expect(client.port).toBe(config.unencrypted_unauthenticated.port);
	});

	it("subscribes and unsubscribes to topic", async () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);

		client.mount();
		await waitForState(client, "connected");

		const unsubscribe = client.subscribe(MESSAGE_TOPIC, () => {});

		expect(
			client.isSubscribed(MESSAGE_TOPIC),
			"topic was not subscribed too",
		).toBeTruthy();

		unsubscribe();

		expect(
			client.isSubscribed(MESSAGE_TOPIC),
			"topic was not unsubscribed too",
		).toBeFalsy();
	});

	it(
		"fails to subscribe when not in connected state",
		async () => {
			const client = new MQTTClient(config.unencrypted_unauthenticated);

			client.subscribe(MESSAGE_TOPIC, () => {}, {
				onFailure: () => {
					throw new Error("Failed to subscribe");
				},
			});
		},
		{ fails: true },
	);

	it("fails to publish when not in connected state", async () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);

		const result = client.publish(MESSAGE_TOPIC, "");

		expect(result).toBeFalsy();
	});

	it("publishes messsage", async () => {
		const client = new MQTTClient(config.unencrypted_unauthenticated);

		client.mount();
		await waitForState(client, "connected");

		const result = client.publish(MESSAGE_TOPIC, "");

		expect(result).toBeTruthy();
	});
});
