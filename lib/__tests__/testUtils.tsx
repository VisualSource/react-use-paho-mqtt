import MQTT from "paho-mqtt";
import { MQTTClient, type MQTTClientOptions } from "../MQTTClient";
import { MqttProvider } from "../MqttProvider";
import type {
	ConnectionOptions,
	IClient,
	Message,
	Qos,
	Status,
	StatusEvent,
	SubscribeOptions,
	UnsubscribeOptions,
} from "../types";

class FakeMQTTClient implements IClient {
	private _clientId: string;
	constructor(host: string, port: number, path: string, clientId: string);
	constructor(uri: string, id: string);
	constructor(
		_host: string,
		portId?: string | number,
		_path?: string,
		_clientId?: string,
	) {
		if (typeof portId === "string") {
			this._clientId = portId;
		} else {
			this._clientId = "MQTT-CLIENT";
		}
	}

	onConnectionLost(_ev: { errorCode: number; errorMessage: string }): void {
		throw new Error("Method not implemented.");
	}
	onMessageArrived(_ev: Message): void {
		throw new Error("Method not implemented.");
	}
	connect(_opt?: ConnectionOptions): void {}
	isConnected(): boolean {
		return true;
	}
	subscribe(_filter: string, _subcribeOptions?: SubscribeOptions): void {
		throw new Error("Method not implemented.");
	}
	unsubscribe(_filter: string, _unsubcribeOptions?: UnsubscribeOptions): void {
		throw new Error("Method not implemented.");
	}
	startTrace(): void {
		throw new Error("Method not implemented.");
	}
	stopTrace(): void {
		throw new Error("Method not implemented.");
	}
	disconnect(): void {}
	getTraceLog(): unknown[] {
		throw new Error("Method not implemented.");
	}
	send(
		_topic: string,
		_payload: string | ArrayBuffer,
		_qos?: Qos,
		_retained?: boolean,
	): void {
		throw new Error("Method not implemented.");
	}
	get host(): string {
		return "HOST";
	}
	get port(): number {
		return 9000;
	}
	get path(): string {
		return "/mqtt";
	}
	get clientId(): string {
		return this._clientId;
	}
}

export const makeClient = (options: MQTTClientOptions) =>
	new MQTTClient(options, MQTT.Client);
export const makeFakeClient = () => new MQTTClient({}, FakeMQTTClient);

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
		useSSL: false,
	} as MQTTClientOptions,
	encrypted_unauthenticated: {
		useSSL: true,
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
		useSSL: false,
	} as MQTTClientOptions,
	encrypted_authenticated: {
		useSSL: true,
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
	const c = client ? client : makeClient(options);
	return ({ children }: React.PropsWithChildren) => (
		<MqttProvider client={c}>{children}</MqttProvider>
	);
};
