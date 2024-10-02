import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MqttProvider } from "../MqttProvider";
import { makeFakeClient } from "./testUtils";

describe("MQTTProvider", () => {
	it("should mount once", () => {
		const client = makeFakeClient();
		const spyMount = vi.spyOn(client, "mount");
		render(<MqttProvider client={client}>Content</MqttProvider>);

		expect(spyMount).toHaveBeenCalledOnce();
	});

	it("should pass children", () => {
		const client = makeFakeClient();
		const { getByText } = render(
			<MqttProvider client={client}>Content</MqttProvider>,
		);
		expect(getByText(/Content/i)).toBeInTheDocument();
	});

	it("should unmount", () => {
		const client = makeFakeClient();

		const spyMount = vi.spyOn(client, "mount");
		const spyUnmpunt = vi.spyOn(client, "unmount");

		const { unmount } = render(
			<MqttProvider client={client}>Content</MqttProvider>,
		);

		expect(spyMount).toHaveBeenCalledOnce();
		unmount();
		expect(spyUnmpunt).toHaveBeenCalledOnce();
	});

	afterEach(() => {
		cleanup();
	});
});
